package handlers

import (
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"
	"strconv"
	"sync"
	"time"

	"dailybible/internal/repository"
	"dailybible/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/stripe/stripe-go/v80"
	checkoutsession "github.com/stripe/stripe-go/v80/checkout/session"
	"github.com/stripe/stripe-go/v80/webhook"
	"golang.org/x/time/rate"
)

// SubscriptionHandler handles all /api/subscription and /api/webhooks/stripe endpoints.
type SubscriptionHandler struct {
	subscriptionService *services.SubscriptionService
	subscriptionChecker services.SubscriptionChecker
	cachedChecker       *services.CachedSubscriptionChecker // nil when caching is not configured
	userRepo            repository.UserRepository
	// Per-user rate limiters: max 3 checkout requests per 5 minutes.
	limiters   map[uint]*rate.Limiter
	limitersMu sync.Mutex
}

// NewSubscriptionHandler creates a SubscriptionHandler.
// cachedChecker may be nil if subscription caching is not in use.
func NewSubscriptionHandler(
	subscriptionService *services.SubscriptionService,
	subscriptionChecker services.SubscriptionChecker,
	cachedChecker *services.CachedSubscriptionChecker,
	userRepo repository.UserRepository,
) *SubscriptionHandler {
	return &SubscriptionHandler{
		subscriptionService: subscriptionService,
		subscriptionChecker: subscriptionChecker,
		cachedChecker:       cachedChecker,
		userRepo:            userRepo,
		limiters:            make(map[uint]*rate.Limiter),
	}
}

// getUserLimiter returns (or creates) the per-user rate limiter.
// Allows 3 checkout requests per ~5 minutes (1 token per 100s, burst 3).
func (h *SubscriptionHandler) getUserLimiter(userID uint) *rate.Limiter {
	h.limitersMu.Lock()
	defer h.limitersMu.Unlock()
	if l, ok := h.limiters[userID]; ok {
		return l
	}
	l := rate.NewLimiter(rate.Every(100*time.Second), 3)
	h.limiters[userID] = l
	return l
}

// HandleStripeWebhook handles POST /api/webhooks/stripe.
// Must be on the public router — no auth middleware.
// Validates the Stripe signature before any processing.
func (h *SubscriptionHandler) HandleStripeWebhook(c *gin.Context) {
	// Read raw body BEFORE Gin touches it.
	payload, err := io.ReadAll(c.Request.Body)
	if err != nil {
		c.Status(http.StatusBadRequest)
		return
	}

	// Validate Stripe signature.
	sig := c.GetHeader("Stripe-Signature")
	event, err := webhook.ConstructEvent(payload, sig, os.Getenv("STRIPE_WEBHOOK_SECRET"))
	if err != nil {
		// Do NOT log the payload — may contain PII.
		log.Printf("Stripe webhook signature validation failed: %v", err)
		c.Status(http.StatusBadRequest)
		return
	}

	// Dispatch — always return 200 after business-logic errors to prevent Stripe retry storms.
	// Return 500 only on genuine transient failures (DB commit failures) so Stripe retries.
	switch event.Type {

	case "checkout.session.completed":
		var session stripe.CheckoutSession
		if err := json.Unmarshal(event.Data.Raw, &session); err != nil {
			log.Printf("Webhook: failed to parse checkout session: %v", err)
			c.Status(http.StatusOK)
			return
		}
		// Only fulfill one-time purchases (mode=payment).
		// Subscription mode is not used — all purchases are one-time.
		if session.Mode != stripe.CheckoutSessionModePayment {
			c.Status(http.StatusOK)
			return
		}
		productKey := session.Metadata["product_key"]
		userIDStr := session.Metadata["user_id"]
		userID, err := strconv.ParseUint(userIDStr, 10, 64)
		if err != nil || productKey == "" {
			log.Printf("Webhook: checkout.session.completed missing metadata: userID=%q productKey=%q", userIDStr, productKey)
			c.Status(http.StatusOK)
			return
		}
		// Run inside a transaction — only return 200 after commit. Return 500 so Stripe retries on failure.
		if err := h.subscriptionService.HandleOneTimePurchase(uint(userID), productKey, session.ID); err != nil {
			log.Printf("Webhook: HandleOneTimePurchase(%d, %q, %q) failed: %v", userID, productKey, session.ID, err)
			c.Status(http.StatusInternalServerError)
			return
		}

	}

	c.Status(http.StatusOK)
}

// GetStatus handles GET /api/subscription/status.
func (h *SubscriptionHandler) GetStatus(c *gin.Context) {
	userID := c.MustGet("userID").(uint)
	sub := h.subscriptionService.GetSubscription(userID)
	isPremium := h.subscriptionChecker.IsPremium(userID)
	ownedKeys := h.subscriptionService.GetOwnedPurchaseKeys(userID)

	c.JSON(http.StatusOK, gin.H{
		"status":              sub.Status,
		"plan":                sub.Plan,
		"period_end":          sub.CurrentPeriodEnd,
		"is_premium":          isPremium,
		"canceled_at":         sub.CanceledAt,
		"owned_purchase_keys": ownedKeys,
	})
}

// CreateCheckout handles POST /api/subscription/checkout.
// Accepts { "product_key": "..." } for one-time purchases (including "premium_lifetime").
func (h *SubscriptionHandler) CreateCheckout(c *gin.Context) {
	userID := c.MustGet("userID").(uint)

	// Per-user rate limit: max 3 checkout requests per 5 minutes.
	if !h.getUserLimiter(userID).Allow() {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "too many requests — please wait before trying again"})
		return
	}

	var req struct {
		ProductKey string `json:"product_key"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.ProductKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "product_key is required"})
		return
	}

	// Check pending checkout tracking — prevents duplicate sessions (§8.18.1).
	existing := h.subscriptionService.GetSubscription(userID)
	if existing.PendingCheckoutExpiresAt != nil && existing.PendingCheckoutExpiresAt.After(time.Now()) {
		sess, err := checkoutsession.Get(existing.PendingCheckoutSessionID, nil)
		if err == nil && sess.URL != "" {
			c.JSON(http.StatusOK, gin.H{"url": sess.URL})
			return
		}
		// Session expired on Stripe's side — fall through to create a new one.
	}

	user, err := h.userRepo.GetByID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	customerID, err := h.subscriptionService.GetOrCreateStripeCustomer(userID, user.Email, user.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create customer"})
		return
	}

	priceID := services.ProductKeyToPriceID(req.ProductKey)
	if priceID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "unknown product_key"})
		return
	}

	frontendBase := os.Getenv("FRONTEND_BASE_URL")
	params := &stripe.CheckoutSessionParams{
		Customer: stripe.String(customerID),
		Mode:     stripe.String(string(stripe.CheckoutSessionModePayment)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{Price: stripe.String(priceID), Quantity: stripe.Int64(1)},
		},
		SuccessURL: stripe.String(frontendBase + "/shop?purchased=" + req.ProductKey),
		CancelURL:  stripe.String(frontendBase + "/shop"),
		Metadata: map[string]string{
			"user_id":     strconv.Itoa(int(userID)),
			"product_key": req.ProductKey,
		},
	}

	session, err := checkoutsession.New(params)
	if err != nil {
		log.Printf("Checkout: Stripe session creation failed for userID=%d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create checkout session"})
		return
	}

	if session.URL == "" {
		log.Printf("Checkout: Stripe returned empty URL for userID=%d productKey=%q", userID, req.ProductKey)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create checkout session"})
		return
	}

	// Store pending checkout ID for duplicate-session detection (§8.18.1).
	expiresAt := time.Now().Add(24 * time.Hour)
	h.subscriptionService.StorePendingCheckout(userID, session.ID, expiresAt)

	c.JSON(http.StatusOK, gin.H{"url": session.URL})
}

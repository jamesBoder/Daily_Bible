package services

import (
	"sync"
	"time"
)

// cachedEntry holds a single user's premium status with a TTL timestamp.
type cachedEntry struct {
	isPremium bool
	expiresAt time.Time
}

// CachedSubscriptionChecker wraps any SubscriptionChecker and caches the
// result per user for cacheTTL. This eliminates the repeated DB query that
// IsPremium triggers on every premium-gated request within a session.
//
// Cache invalidation:
//   - TTL expiry (default 5 minutes) — covers normal expiration.
//   - Explicit Invalidate(userID) call from the Stripe webhook handler —
//     ensures a cancel or new subscription takes effect within seconds.
//
// Thread-safe: all map access is protected by sync.RWMutex.
type CachedSubscriptionChecker struct {
	inner    SubscriptionChecker
	cacheTTL time.Duration
	mu       sync.RWMutex
	cache    map[uint]cachedEntry
}

// NewCachedSubscriptionChecker wraps inner with a cache using the given TTL.
// Use ttl=0 to apply the default of 5 minutes.
func NewCachedSubscriptionChecker(inner SubscriptionChecker, ttl time.Duration) *CachedSubscriptionChecker {
	if ttl == 0 {
		ttl = 5 * time.Minute
	}
	return &CachedSubscriptionChecker{
		inner:    inner,
		cacheTTL: ttl,
		cache:    make(map[uint]cachedEntry),
	}
}

// IsPremium returns the cached premium status for userID, refreshing from the
// underlying checker if the entry is absent or expired.
func (c *CachedSubscriptionChecker) IsPremium(userID uint) bool {
	// Fast path: read lock, check cache.
	c.mu.RLock()
	entry, ok := c.cache[userID]
	c.mu.RUnlock()

	if ok && time.Now().Before(entry.expiresAt) {
		return entry.isPremium
	}

	// Slow path: query the real checker and populate cache.
	isPremium := c.inner.IsPremium(userID)

	c.mu.Lock()
	c.cache[userID] = cachedEntry{
		isPremium: isPremium,
		expiresAt: time.Now().Add(c.cacheTTL),
	}
	c.mu.Unlock()

	return isPremium
}

// Invalidate removes the cached entry for userID, forcing the next IsPremium
// call to re-query the database. Call this from the Stripe webhook handler
// when a subscription status changes.
func (c *CachedSubscriptionChecker) Invalidate(userID uint) {
	c.mu.Lock()
	delete(c.cache, userID)
	c.mu.Unlock()
}

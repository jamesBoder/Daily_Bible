package services

import (
	"os"
	"strconv"
	"strings"
)

// SubscriptionChecker is a thin interface defined now so StreakService and
// BlessingsService depend on an interface, not a concrete type.
// Phase 8 provides the real implementation.
type SubscriptionChecker interface {
	IsPremium(userID uint) bool
}

// StubSubscriptionChecker is the Phase 1–7 implementation: everyone is free
// except any user IDs listed in the DEV_PREMIUM_USER_IDS env var (comma-separated).
// Example: DEV_PREMIUM_USER_IDS=3,7
type StubSubscriptionChecker struct {
	overrideIDs map[uint]bool
}

// NewStubSubscriptionChecker creates a StubSubscriptionChecker, loading any
// developer override IDs from the DEV_PREMIUM_USER_IDS environment variable.
func NewStubSubscriptionChecker() SubscriptionChecker {
	overrides := map[uint]bool{}
	if raw := os.Getenv("DEV_PREMIUM_USER_IDS"); raw != "" {
		for _, part := range strings.Split(raw, ",") {
			part = strings.TrimSpace(part)
			if id, err := strconv.ParseUint(part, 10, 64); err == nil {
				overrides[uint(id)] = true
			}
		}
	}
	return &StubSubscriptionChecker{overrideIDs: overrides}
}

func (s *StubSubscriptionChecker) IsPremium(userID uint) bool {
	return s.overrideIDs[userID]
}
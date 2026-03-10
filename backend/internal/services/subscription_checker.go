package services

// SubscriptionChecker is a thin interface defined now so StreakService and
// BlessingsService depend on an interface, not a concrete type.
// Phase 8 provides the real implementation.
type SubscriptionChecker interface {
    IsPremium(userID uint) bool
}

// StubSubscriptionChecker is the Phase 1–7 implementation: everyone is free.
type StubSubscriptionChecker struct{}

// NewStubSubscriptionChecker creates a new StubSubscriptionChecker
func NewStubSubscriptionChecker() SubscriptionChecker {
    return &StubSubscriptionChecker{}
}

func (s *StubSubscriptionChecker) IsPremium(_ uint) bool { 
    return false 
}
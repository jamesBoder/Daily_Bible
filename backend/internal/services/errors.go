package services

import "errors"

var (
	ErrNoGraceDaysRemaining     = errors.New("no grace days remaining")
	ErrNoStreakToRecover        = errors.New("no streak to recover")
	ErrStreakAlreadyActiveToday = errors.New("streak already active today")
	ErrStreakNotRecoverable     = errors.New("streak is not recoverable — the missed day was not yesterday")
	ErrInsufficientBlessings    = errors.New("insufficient blessings balance")
)

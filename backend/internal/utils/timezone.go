package utils

import (
	"log"
	"time"
)

// TodayLocal returns today's date in the user's local timezone as "YYYY-MM-DD"
func TodayLocal(ianaName string) string {
	loc := loadLocation(ianaName)
	return time.Now().In(loc).Format("2006-01-02")
}

// YesterdayLocal returns yesterday's date in the user's local timezone as "YYYY-MM-DD"
func YesterdayLocal(ianaName string) string {
	loc := loadLocation(ianaName)
	return time.Now().In(loc).AddDate(0, 0, -1).Format("2006-01-02")
}

// DaysAgoLocal returns the date N days ago in the user's local timezone as "YYYY-MM-DD"
func DaysAgoLocal(ianaName string, days int) string {
	loc := loadLocation(ianaName)
	return time.Now().In(loc).AddDate(0, 0, -days).Format("2006-01-02")
}

// loadLocation loads a timezone location from an IANA name
func loadLocation(ianaName string) *time.Location {
	if ianaName == "" {
		return time.UTC
	}
	loc, err := time.LoadLocation(ianaName)
	if err != nil {
		// Log the bad timezone name — this indicates a data quality issue.
		// Fall back to UTC rather than panic.
		log.Printf("invalid IANA timezone %q, falling back to UTC", ianaName)
		return time.UTC
	}
	return loc
}

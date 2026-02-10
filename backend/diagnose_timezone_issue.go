package main

import (
	"fmt"
	"time"
)

func main() {
	fmt.Println("=== Diagnosing Timezone Issue ===\n")
	
	// Get current time
	now := time.Now()
	
	// Load UTC+14 timezone
	loc, err := time.LoadLocation("Pacific/Kiritimati")
	if err != nil {
		fmt.Printf("Error loading timezone: %v\n", err)
		return
	}
	
	// Current times
	nowUTC := now.UTC()
	nowKiritimati := now.In(loc)
	locEastern, _ := time.LoadLocation("America/New_York")
	nowEastern := now.In(locEastern)
	
	fmt.Println("CURRENT TIME:")
	fmt.Printf("  Eastern:    %s\n", nowEastern.Format("2006-01-02 15:04:05 MST"))
	fmt.Printf("  UTC:        %s\n", nowUTC.Format("2006-01-02 15:04:05 MST"))
	fmt.Printf("  Kiritimati: %s\n", nowKiritimati.Format("2006-01-02 15:04:05 MST"))
	fmt.Println()
	
	// Dates being used
	dateUTC := nowUTC.Format("2006-01-02")
	dateKiritimati := nowKiritimati.Format("2006-01-02")
	dateEastern := nowEastern.Format("2006-01-02")
	
	fmt.Println("DATES CALCULATED:")
	fmt.Printf("  Eastern date:    %s\n", dateEastern)
	fmt.Printf("  UTC date:        %s\n", dateUTC)
	fmt.Printf("  Kiritimati date: %s (THIS IS WHAT THE APP USES)\n", dateKiritimati)
	fmt.Println()
	
	// The critical issue
	fmt.Println("THE PROBLEM:")
	fmt.Println("When it's 7 PM Eastern (midnight UTC):")
	
	// Simulate 7 PM Eastern
	sevenPMEastern := time.Date(nowEastern.Year(), nowEastern.Month(), nowEastern.Day(), 19, 0, 0, 0, locEastern)
	sevenPMUTC := sevenPMEastern.UTC()
	sevenPMKiritimati := sevenPMEastern.In(loc)
	
	fmt.Printf("  Eastern:    %s\n", sevenPMEastern.Format("2006-01-02 15:04:05 MST"))
	fmt.Printf("  UTC:        %s\n", sevenPMUTC.Format("2006-01-02 15:04:05 MST"))
	fmt.Printf("  Kiritimati: %s\n", sevenPMKiritimati.Format("2006-01-02 15:04:05 MST"))
	fmt.Printf("  Kiritimati DATE: %s (NEXT DAY!)\n", sevenPMKiritimati.Format("2006-01-02"))
	fmt.Println()
	
	fmt.Println("This means at 7 PM Eastern:")
	fmt.Println("  - It's midnight UTC (start of new day in UTC)")
	fmt.Println("  - It's 2 PM NEXT DAY in Kiritimati")
	fmt.Println("  - The app calculates the date as TOMORROW in Kiritimati")
	fmt.Println("  - So it fetches/creates a verse for tomorrow")
	fmt.Println("  - Users see a NEW verse at 7 PM Eastern!")
	fmt.Println()
	
	fmt.Println("SOLUTION:")
	fmt.Println("The issue is that UTC+14 is TOO FAR AHEAD.")
	fmt.Println("We need a timezone that:")
	fmt.Println("  1. Changes date BEFORE 7 PM Eastern")
	fmt.Println("  2. Changes date EARLY in the morning for most users")
	fmt.Println()
	
	// Test different scenarios
	fmt.Println("TESTING DIFFERENT TIMES:")
	testTimes := []struct {
		hour int
		desc string
	}{
		{0, "Midnight Eastern"},
		{5, "5 AM Eastern (DESIRED UPDATE TIME)"},
		{7, "7 AM Eastern"},
		{12, "Noon Eastern"},
		{19, "7 PM Eastern (CURRENT PROBLEM TIME)"},
		{23, "11 PM Eastern"},
	}
	
	for _, tt := range testTimes {
		testTime := time.Date(nowEastern.Year(), nowEastern.Month(), nowEastern.Day(), tt.hour, 0, 0, 0, locEastern)
		testTimeKiritimati := testTime.In(loc)
		testDateKiritimati := testTimeKiritimati.Format("2006-01-02")
		testDateEastern := testTime.Format("2006-01-02")
		
		dateChanged := testDateKiritimati != testDateEastern
		marker := ""
		if dateChanged {
			marker = " ← DATE CHANGED IN KIRITIMATI"
		}
		
		fmt.Printf("  %s: Kiritimati date = %s%s\n", tt.desc, testDateKiritimati, marker)
	}
	fmt.Println()
	
	fmt.Println("ANALYSIS:")
	fmt.Println("The Kiritimati date changes to the NEXT day at 7 PM Eastern!")
	fmt.Println("This is because:")
	fmt.Println("  7 PM Eastern = Midnight UTC = 2 PM NEXT DAY in Kiritimati (UTC+14)")
	fmt.Println()
	fmt.Println("FIX NEEDED:")
	fmt.Println("We should use a timezone that's BEHIND UTC, not ahead.")
	fmt.Println("Recommendation: Use UTC-10 (Hawaii) or UTC-11 (American Samoa)")
	fmt.Println("This way, the date changes at 2-3 AM Eastern, not 7 PM!")
}

package config

// MilestoneDef defines a single milestone in the faithfulness journey.
// Milestone definitions are hardcoded — they never change at runtime.
// A database table would add query overhead for zero benefit.
type MilestoneDef struct {
	Key              string
	DaysRequired     int
	Name             string // English — frontend resolves display name via i18n key "milestone.{key}.name"
	BlessingsAwarded int
}

// MilestoneDefinitions is the canonical ordered list of all milestones.
// Ordered by DaysRequired ascending. CheckMilestones and NextMilestone rely on this order.
var MilestoneDefinitions = []MilestoneDef{
	{Key: "first_steps", DaysRequired: 3, Name: "First Steps", BlessingsAwarded: 25},
	{Key: "week_in_word", DaysRequired: 7, Name: "A Week in the Word", BlessingsAwarded: 35},
	{Key: "rooted", DaysRequired: 14, Name: "Rooted", BlessingsAwarded: 50},
	{Key: "month_of_grace", DaysRequired: 30, Name: "A Month of Grace", BlessingsAwarded: 75},
	{Key: "steadfast", DaysRequired: 60, Name: "Steadfast", BlessingsAwarded: 85},
	{Key: "three_month", DaysRequired: 90, Name: "Three-Month Testimony", BlessingsAwarded: 90},
	{Key: "half_year", DaysRequired: 180, Name: "Half a Year of Faithfulness", BlessingsAwarded: 95},
	{Key: "nine_months", DaysRequired: 270, Name: "Nine Months of Growth", BlessingsAwarded: 100},
	{Key: "full_year", DaysRequired: 365, Name: "A Full Year in the Word", BlessingsAwarded: 100},
}

// NextMilestone returns the first unachieved milestone definition for the given
// achieved set. Returns nil when all milestones are complete.
func NextMilestone(currentStreak int, achieved map[string]bool) *MilestoneDef {
	for i := range MilestoneDefinitions {
		def := &MilestoneDefinitions[i]
		if !achieved[def.Key] {
			return def
		}
	}
	return nil // all milestones complete
}

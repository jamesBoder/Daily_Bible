package moderation

import goaway "github.com/TwiN/go-away"

// profanityDetector is the shared detector instance with the default English
// word list plus any custom additions for this app's community context.
var profanityDetector *goaway.ProfanityDetector

// faithFalsePositives are words the default go-away list flags that are
// completely normal in a faith-community context.
var faithFalsePositives = []string{"damn", "hell", "ass", "bastard"}

func buildDetector(extraProfanities []string) *goaway.ProfanityDetector {
	// Merge the default word list with any custom additions.
	profanities := append(goaway.DefaultProfanities, extraProfanities...)
	// Merge faith-safe exceptions into the default false-positive list.
	falsePositives := append(goaway.DefaultFalsePositives, faithFalsePositives...)
	return goaway.NewProfanityDetector().WithCustomDictionary(
		profanities,
		falsePositives,
		goaway.DefaultFalseNegatives,
	)
}

func init() {
	profanityDetector = buildDetector(nil)
}

// ContainsProfanity returns true if text contains profanity (case-insensitive,
// handles common leet-speak substitutions like a→4, e→3, i→1, o→0, s→5).
func ContainsProfanity(text string) bool {
	return profanityDetector.IsProfane(text)
}

// AddCustomWords appends extra profanity words to the default list.
// Intended for admin tooling or future configuration loading.
func AddCustomWords(extraProfanities []string) {
	profanityDetector = buildDetector(extraProfanities)
}

package services

import "testing"

// TestStripHTML verifies that stripHTML correctly removes HTML tags and
// embedded verse numbers from Bible API content in all known patterns.
func TestStripHTML(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			// The exact bug reported: Hebrews 10:23-25 returned "24And" and "25Not"
			// because the API embeds verse numbers even with include-verse-numbers=false.
			name:     "Hebrews 10:23-25 - verse numbers after closing paren (reported bug)",
			input:    "Let us hold fast the profession of our faith without wavering; (for he is faithful that promised;) 24And let us consider one another to provoke unto love and to good works: 25Not forsaking the assembling of ourselves together, as the manner of some is; but exhorting one another: and so much the more, as ye see the day approaching.",
			expected: "Let us hold fast the profession of our faith without wavering; (for he is faithful that promised;) And let us consider one another to provoke unto love and to good works: Not forsaking the assembling of ourselves together, as the manner of some is; but exhorting one another: and so much the more, as ye see the day approaching.",
		},
		{
			// Verse number at the very start of the text (e.g. single-verse passage
			// where the API still prepends the verse number).
			name:     "verse number at start of text",
			input:    "23Let us hold fast the profession of our faith without wavering.",
			expected: "Let us hold fast the profession of our faith without wavering.",
		},
		{
			// Verse number directly concatenated with the next word after a period.
			name:     "verse number concatenated after period",
			input:    "The Lord is my shepherd. 2He maketh me to lie down in green pastures.",
			expected: "The Lord is my shepherd. He maketh me to lie down in green pastures.",
		},
		{
			// Verse number directly concatenated with the next word after a semicolon.
			name:     "verse number concatenated after semicolon",
			input:    "For God so loved the world; 4And he gave his only Son.",
			expected: "For God so loved the world; And he gave his only Son.",
		},
		{
			// Verse number directly concatenated with the next word after a colon.
			name:     "verse number concatenated after colon",
			input:    "Blessed are the poor in spirit: 3for theirs is the kingdom of heaven.",
			expected: "Blessed are the poor in spirit: for theirs is the kingdom of heaven.",
		},
		{
			// Multi-verse passage with three inline verse numbers.
			name:     "multi-verse passage with multiple inline numbers",
			input:    "3Blessed are the poor in spirit: for theirs is the kingdom of heaven. 4Blessed are they that mourn: for they shall be comforted. 5Blessed are the meek: for they shall inherit the earth.",
			expected: "Blessed are the poor in spirit: for theirs is the kingdom of heaven. Blessed are they that mourn: for they shall be comforted. Blessed are the meek: for they shall inherit the earth.",
		},
		{
			// HTML tags should be stripped (API may return HTML content-type).
			name:     "HTML tags stripped",
			input:    "<p>For God so loved the world.</p>",
			expected: "For God so loved the world.",
		},
		{
			// HTML tags with embedded verse number.
			name:     "HTML tags with embedded verse number",
			input:    "<p><span>16</span>For God so loved the world, that he gave his only begotten Son.</p>",
			expected: "For God so loved the world, that he gave his only begotten Son.",
		},
		{
			// Clean text with no verse numbers or HTML should pass through unchanged.
			name:     "clean text passes through unchanged",
			input:    "For God so loved the world, that he gave his only begotten Son.",
			expected: "For God so loved the world, that he gave his only begotten Son.",
		},
		{
			// Extra whitespace should be collapsed to single spaces.
			name:     "extra whitespace collapsed",
			input:    "For God   so loved   the world.",
			expected: "For God so loved the world.",
		},
		{
			// Leading and trailing whitespace should be trimmed.
			name:     "leading and trailing whitespace trimmed",
			input:    "   For God so loved the world.   ",
			expected: "For God so loved the world.",
		},
	}

	passed := 0
	failed := 0

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := stripHTML(tt.input)
			if got != tt.expected {
				t.Errorf("\n  Input:    %q\n  Expected: %q\n  Got:      %q", tt.input, tt.expected, got)
				failed++
			} else {
				passed++
			}
		})
	}

	t.Logf("Results: %d passed, %d failed", passed, failed)
}

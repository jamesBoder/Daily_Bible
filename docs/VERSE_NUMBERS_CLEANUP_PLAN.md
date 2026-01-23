# Verse Numbers Cleanup Plan

## Problem Statement
Standalone numerical verse numbers (1, 2, 3, etc.) are appearing in the verse text displayed to users. These numbers come from the Bible API response and are not being properly removed during HTML stripping.

## Root Cause
The `stripHTML()` function in `backend/internal/services/bible_api_service.go` only removes HTML tags but doesn't remove the verse numbers that remain after tag removal.

Example of problematic content from API:
```
<sup>1</sup>In the beginning God created the heavens and the earth.
```

After current `stripHTML()`:
```
1In the beginning God created the heavens and the earth.  // ❌ Number remains
```

Expected result:
```
In the beginning God created the heavens and the earth.  // ✅ Clean text
```

## Impact Areas
1. **DailyVerse component** - Main verse display
2. **FavoritesList component** - Saved verses
3. **HistoryList component** - Verse history
4. **Share functionality** - Copied/shared text

## Solution Overview

### Part 1: Fix the `stripHTML()` Function (Going Forward)

**File:** `backend/internal/services/bible_api_service.go`

**Current Implementation:**
```go
func stripHTML(html string) string {
    // Remove HTML tags
    re := regexp.MustCompile(`<[^>]*>`)
    text := re.ReplaceAllString(html, "")
    
    // Clean up extra whitespace
    text = strings.TrimSpace(text)
    text = regexp.MustCompile(`\s+`).ReplaceAllString(text, " ")
    
    return text
}
```

**Enhanced Implementation:**
```go
func stripHTML(html string) string {
    // Remove HTML tags
    re := regexp.MustCompile(`<[^>]*>`)
    text := re.ReplaceAllString(html, "")
    
    // Remove verse numbers at the beginning of text
    // Matches: "1 ", "12 ", "123 " at start
    text = regexp.MustCompile(`^\d+\s+`).ReplaceAllString(text, "")
    
    // Remove verse numbers in the middle of text
    // Matches: " 1 ", " 12 ", " 123 " between words
    text = regexp.MustCompile(`\s+\d+\s+`).ReplaceAllString(text, " ")
    
    // Clean up extra whitespace
    text = strings.TrimSpace(text)
    text = regexp.MustCompile(`\s+`).ReplaceAllString(text, " ")
    
    return text
}
```

**Regex Patterns Explained:**
- `^\d+\s+` - Removes numbers at the start (e.g., "1 In the beginning")
- `\s+\d+\s+` - Removes numbers between words (e.g., "earth. 2 And the earth")

### Part 2: Clean Existing Database Verses

**File:** `cleanup_verse_numbers.sh` (new script)

**Purpose:** Update all existing verses in the database to remove verse numbers

**Implementation:**
```bash
#!/bin/bash

# Script to clean verse numbers from existing verses in database

echo "Starting verse number cleanup..."

# SQL to update all verses by removing leading numbers and numbers between words
sqlite3 backend/daily_bible.db <<EOF
-- Update verses to remove verse numbers
UPDATE verses 
SET text = TRIM(
    -- Remove multiple spaces
    REPLACE(
        REPLACE(
            REPLACE(
                -- Remove leading numbers (e.g., "1 In the beginning")
                CASE 
                    WHEN text GLOB '[0-9]* *' 
                    THEN SUBSTR(text, INSTR(text, ' ') + 1)
                    ELSE text
                END,
                '  ', ' '
            ),
            '  ', ' '
        ),
        '  ', ' '
    )
)
WHERE text GLOB '*[0-9]*';

-- Show count of updated verses
SELECT COUNT(*) as 'Verses Updated' FROM verses WHERE text LIKE '% %';

EOF

echo "Verse number cleanup complete!"
echo "Please verify the changes by checking a few verses in the application."
```

**Alternative: SQL-only approach for more complex cleaning:**
```sql
-- For more sophisticated cleaning, we can use a series of REPLACE operations
UPDATE verses 
SET text = TRIM(
    REPLACE(
        REPLACE(
            REPLACE(
                REPLACE(
                    REPLACE(text, ' 1 ', ' '),
                    ' 2 ', ' '
                ),
                ' 3 ', ' '
            ),
            -- Continue for common verse numbers 1-50
            '  ', ' '
        ),
        '  ', ' '
    )
);
```

### Part 3: Verification Steps

1. **Test the enhanced `stripHTML()` function:**
   ```bash
   # Fetch a new verse and verify clean text
   curl -X GET http://localhost:8080/api/verses/daily \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Run the cleanup script:**
   ```bash
   chmod +x cleanup_verse_numbers.sh
   ./cleanup_verse_numbers.sh
   ```

3. **Verify in the application:**
   - Check Daily Verse display
   - Check Favorites list
   - Check History list
   - Test share functionality

4. **Database verification:**
   ```bash
   sqlite3 backend/daily_bible.db "SELECT id, reference, text FROM verses LIMIT 5;"
   ```

## Implementation Steps

### Step 1: Enhance stripHTML() Function
- [ ] Update `backend/internal/services/bible_api_service.go`
- [ ] Add regex patterns to remove verse numbers
- [ ] Test with sample HTML content

### Step 2: Create Cleanup Script
- [ ] Create `cleanup_verse_numbers.sh`
- [ ] Add SQL commands to clean existing verses
- [ ] Make script executable

### Step 3: Testing
- [ ] Test stripHTML() with various verse formats
- [ ] Run cleanup script on database
- [ ] Verify verses display without numbers
- [ ] Test all affected components

### Step 4: Documentation
- [ ] Update this document with results
- [ ] Document any edge cases found
- [ ] Add notes about future maintenance

## Edge Cases to Consider

1. **Legitimate numbers in verse text:**
   - Example: "40 days and 40 nights"
   - Solution: Only remove numbers at start or between sentences, not within sentences

2. **Multiple verse passages:**
   - Example: Verses 1-3 combined
   - Solution: Remove all standalone verse numbers

3. **Special formatting:**
   - Poetry, psalms with unique formatting
   - Solution: Test with various verse types

## Rollback Plan

If issues arise:
1. Revert `stripHTML()` function changes
2. Restore database from backup (if available)
3. Or re-fetch verses from API with original function

## Success Criteria

- ✅ No standalone numbers visible in verse text
- ✅ Actual verse content remains intact
- ✅ All display components show clean text
- ✅ Share functionality copies clean text
- ✅ No regression in other functionality

## Notes

- This fix is **backend-only** - no frontend changes needed
- The frontend already displays `verse.text` correctly
- Database cleanup is **one-time** operation
- Future verses will be automatically cleaned by enhanced function

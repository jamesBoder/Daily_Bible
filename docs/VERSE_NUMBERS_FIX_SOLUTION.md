# Verse Numbers Fix - Complete Solution

## Problem Confirmed
From your curl output:
```json
"text":"13I can do all things through Christ which strengtheneth me."
```
The verse number "13" is appearing at the start of the text.

## Database Setup
- **Database Type:** PostgreSQL (in Docker)
- **Table Name:** `verses` (created by GORM from models.Verse)
- **Field to Clean:** `text` column

## Solution

### Part 1: Fix stripHTML() Function (Already Done)

The `backend/internal/services/bible_api_service.go` file needs the enhanced `stripHTML()` function.

**Current code:**
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

**Enhanced code (to implement):**
```go
func stripHTML(html string) string {
    // Remove HTML tags
    re := regexp.MustCompile(`<[^>]*>`)
    text := re.ReplaceAllString(html, "")
    
    // Remove verse numbers at the beginning of text
    // Matches: "1 ", "12 ", "123 " at start
    text = regexp.MustCompile(`^\d+\s*`).ReplaceAllString(text, "")
    
    // Remove verse numbers in the middle of text (between sentences)
    // Matches patterns like ". 2 " or "; 3 "
    text = regexp.MustCompile(`([.;!?])\s*\d+\s+`).ReplaceAllString(text, "$1 ")
    
    // Clean up extra whitespace
    text = strings.TrimSpace(text)
    text = regexp.MustCompile(`\s+`).ReplaceAllString(text, " ")
    
    return text
}
```

### Part 2: Clean Existing Database (PostgreSQL in Docker)

**Option A: Using Docker exec with psql**

```bash
#!/bin/bash
# cleanup_verse_numbers_postgres.sh

echo "Starting verse number cleanup for PostgreSQL..."

# Get database credentials from environment or use defaults
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_USER=${DB_USER:-postgres}
DB_NAME=${DB_NAME:-dailybible}

# Find the Docker container running PostgreSQL
CONTAINER_ID=$(docker ps --filter "expose=$DB_PORT" --format "{{.ID}}" | head -n 1)

if [ -z "$CONTAINER_ID" ]; then
    echo "Error: Could not find PostgreSQL Docker container"
    echo "Please provide the container name or ID manually"
    exit 1
fi

echo "Found PostgreSQL container: $CONTAINER_ID"

# Execute SQL to clean verse numbers
docker exec -i $CONTAINER_ID psql -U $DB_USER -d $DB_NAME <<EOF
-- Update verses to remove leading verse numbers
UPDATE verses 
SET text = REGEXP_REPLACE(text, '^\d+\s*', '', 'g')
WHERE text ~ '^\d+\s*';

-- Show count of updated verses
SELECT COUNT(*) as "Verses with leading numbers removed" 
FROM verses 
WHERE text ~ '^\d+';

-- Also remove verse numbers in the middle (after punctuation)
UPDATE verses 
SET text = REGEXP_REPLACE(text, '([.;!?])\s*\d+\s+', '\1 ', 'g')
WHERE text ~ '[.;!?]\s*\d+\s+';

-- Final cleanup of extra spaces
UPDATE verses 
SET text = REGEXP_REPLACE(text, '\s+', ' ', 'g')
WHERE text ~ '\s{2,}';

-- Show sample of cleaned verses
SELECT id, reference, LEFT(text, 100) as text_preview 
FROM verses 
ORDER BY id 
LIMIT 5;
EOF

echo "Verse number cleanup complete!"
echo "Please verify by checking: curl -X GET http://localhost:8080/api/verses/daily -H 'Authorization: Bearer YOUR_TOKEN'"
```

**Option B: Using psql directly (if accessible)**

```bash
#!/bin/bash
# cleanup_verse_numbers_direct.sh

echo "Starting verse number cleanup..."

# Update verses to remove leading numbers
psql -h localhost -p 5432 -U postgres -d dailybible <<EOF
-- Remove leading verse numbers (e.g., "13I can do..." -> "I can do...")
UPDATE verses 
SET text = REGEXP_REPLACE(text, '^\d+\s*', '', 'g')
WHERE text ~ '^\d+';

-- Remove verse numbers after punctuation (e.g., ". 2 And..." -> ". And...")
UPDATE verses 
SET text = REGEXP_REPLACE(text, '([.;!?])\s*\d+\s+', '\1 ', 'g')
WHERE text ~ '[.;!?]\s*\d+\s+';

-- Clean up multiple spaces
UPDATE verses 
SET text = REGEXP_REPLACE(text, '\s+', ' ', 'g')
WHERE text ~ '\s{2,}';

-- Trim leading/trailing spaces
UPDATE verses 
SET text = TRIM(text);

-- Show results
SELECT COUNT(*) as "Total verses cleaned" FROM verses;
SELECT id, reference, text FROM verses ORDER BY id LIMIT 5;
EOF

echo "Cleanup complete!"
```

**Option C: Manual SQL (run in your database client)**

```sql
-- Step 1: Remove leading verse numbers
UPDATE verses 
SET text = REGEXP_REPLACE(text, '^\d+\s*', '', 'g')
WHERE text ~ '^\d+';

-- Step 2: Remove verse numbers after punctuation
UPDATE verses 
SET text = REGEXP_REPLACE(text, '([.;!?])\s*\d+\s+', '\1 ', 'g')
WHERE text ~ '[.;!?]\s*\d+\s+';

-- Step 3: Clean up extra spaces
UPDATE verses 
SET text = REGEXP_REPLACE(text, '\s+', ' ', 'g')
WHERE text ~ '\s{2,}';

-- Step 4: Trim spaces
UPDATE verses 
SET text = TRIM(text);

-- Verify results
SELECT id, reference, text FROM verses ORDER BY id LIMIT 10;
```

## Implementation Steps

### Step 1: Update the Go Code
1. Edit `backend/internal/services/bible_api_service.go`
2. Replace the `stripHTML()` function with the enhanced version
3. Rebuild the Go application (if needed)

### Step 2: Clean Existing Database
Choose one of the options above based on your setup:

**If you know your Docker container name:**
```bash
docker exec -i <container_name> psql -U postgres -d dailybible -c "UPDATE verses SET text = REGEXP_REPLACE(text, '^\d+\s*', '', 'g') WHERE text ~ '^\d+';"
```

**If you need to find the container:**
```bash
docker ps | grep postgres
# Then use the container ID or name
```

### Step 3: Restart the Application
After updating the code:
```bash
# If using docker-compose
docker-compose restart backend

# Or rebuild if needed
docker-compose up -d --build backend
```

### Step 4: Verify the Fix
```bash
# Test with curl
curl -X GET http://localhost:8080/api/verses/daily \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected output (no "13" at the start):
# {"verse":{"text":"I can do all things through Christ which strengtheneth me.",...}}
```

## Quick Fix Command (One-liner)

If you just want to clean the database quickly:

```bash
docker exec -i $(docker ps --filter "expose=5432" --format "{{.ID}}" | head -n 1) psql -U postgres -d dailybible -c "UPDATE verses SET text = REGEXP_REPLACE(text, '^\d+\s*', '', 'g') WHERE text ~ '^\d+';"
```

## Verification Queries

```sql
-- Check if any verses still have leading numbers
SELECT COUNT(*) FROM verses WHERE text ~ '^\d+';

-- View sample verses
SELECT id, reference, LEFT(text, 80) as text_preview 
FROM verses 
ORDER BY id 
LIMIT 10;

-- Check specific verse (Philippians 4:13)
SELECT id, reference, text 
FROM verses 
WHERE reference = 'Philippians 4:13';
```

## Rollback (if needed)

If something goes wrong, you can restore from backup or re-fetch verses from the API by deleting them:

```sql
-- Delete all verses (they will be re-fetched from API)
DELETE FROM verses;

-- Or delete specific verse
DELETE FROM verses WHERE reference = 'Philippians 4:13';
```

## Notes

- The regex `^\d+\s*` matches one or more digits at the start followed by optional whitespace
- The regex `([.;!?])\s*\d+\s+` matches verse numbers after punctuation
- PostgreSQL's `REGEXP_REPLACE` is used instead of SQLite's `REPLACE`
- The `~` operator is PostgreSQL's regex match operator

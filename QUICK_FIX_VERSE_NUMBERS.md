# Quick Fix for Verse Numbers - Step by Step

## Current Problem
Verse text shows: `"13I can do all things through Christ..."`
Should show: `"I can do all things through Christ..."`

## Your Database Info
- **Container ID:** 0cceefc869ff
- **Database User:** dailybible_user
- **Database Name:** daily_bible_dev
- **Database Password:** test123

---

## Option 1: Use the Cleanup Script (Recommended)

```bash
# Make script executable
chmod +x cleanup_verse_numbers_postgres.sh

# Run the script
./cleanup_verse_numbers_postgres.sh
```

---

## Option 2: Manual Command (One-liner)

```bash
docker exec -i 0cceefc869ff psql -U dailybible_user -d daily_bible_dev -c "UPDATE verses SET text = REGEXP_REPLACE(text, '^\d+\s*', '', 'g') WHERE text ~ '^\d+';"
```

---

## Option 3: Interactive PostgreSQL Session

```bash
# Connect to PostgreSQL
docker exec -it 0cceefc869ff psql -U dailybible_user -d daily_bible_dev

# Then run these SQL commands:
```

```sql
-- Remove leading verse numbers
UPDATE verses 
SET text = REGEXP_REPLACE(text, '^\d+\s*', '', 'g')
WHERE text ~ '^\d+';

-- Remove verse numbers after punctuation
UPDATE verses 
SET text = REGEXP_REPLACE(text, '([.;!?])\s*\d+\s+', '\1 ', 'g')
WHERE text ~ '[.;!?]\s*\d+\s+';

-- Clean up extra spaces
UPDATE verses 
SET text = REGEXP_REPLACE(text, '\s+', ' ', 'g')
WHERE text ~ '\s{2,}';

-- Trim spaces
UPDATE verses SET text = TRIM(text);

-- Check results
SELECT id, reference, text FROM verses LIMIT 5;

-- Exit
\q
```

---

## Verify the Fix

```bash
curl -X GET http://localhost:8080/api/verses/daily \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Before:** `"text":"13I can do all things..."`
**After:** `"text":"I can do all things..."`

---

## If You Get Permission Errors

Try with password prompt:
```bash
docker exec -it 0cceefc869ff psql -U dailybible_user -d daily_bible_dev
# Password: test123
```

Or set password in environment:
```bash
export PGPASSWORD=test123
docker exec -i 0cceefc869ff psql -U dailybible_user -d daily_bible_dev -c "UPDATE verses SET text = REGEXP_REPLACE(text, '^\d+\s*', '', 'g') WHERE text ~ '^\d+';"
```

---

## Check Database Before and After

**Before cleanup:**
```bash
docker exec -i 0cceefc869ff psql -U dailybible_user -d daily_bible_dev -c "SELECT id, reference, LEFT(text, 50) FROM verses LIMIT 3;"
```

**After cleanup:**
```bash
docker exec -i 0cceefc869ff psql -U dailybible_user -d daily_bible_dev -c "SELECT id, reference, LEFT(text, 50) FROM verses LIMIT 3;"
```

---

## Troubleshooting

### "role does not exist"
✅ **Fixed!** Use `dailybible_user` instead of `postgres`

### "database does not exist"
✅ **Fixed!** Use `daily_bible_dev` instead of `dailybible`

### "permission denied"
Try adding password:
```bash
export PGPASSWORD=test123
```

### Container not found
Find your container:
```bash
docker ps
# Look for the PostgreSQL container

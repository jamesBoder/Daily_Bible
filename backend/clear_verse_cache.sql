-- Clear Verse Cache Script
-- This script clears the daily_date from all verses in the database
-- Run this after deploying the timezone fix to force fresh verse selection

-- Option 1: Clear all daily_date values (recommended)
-- This will force the app to recalculate and cache verses with the new timezone
UPDATE verses SET daily_date = NULL WHERE daily_date IS NOT NULL;

-- Option 2: Delete all verses that have a daily_date
-- Use this if you want to completely remove cached verses and fetch fresh ones from the API
-- DELETE FROM verses WHERE daily_date IS NOT NULL;

-- Verify the cleanup
SELECT COUNT(*) as verses_with_daily_date FROM verses WHERE daily_date IS NOT NULL;
-- This should return 0 after running Option 1

-- Check all verses
SELECT id, reference, daily_date FROM verses ORDER BY daily_date DESC LIMIT 10;

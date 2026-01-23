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
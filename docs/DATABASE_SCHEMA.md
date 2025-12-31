# Daily Bible App - Database Schema Design

**Document Status:** ✅ Approved  
**Database:** PostgreSQL 14+  
**ORM:** GORM (Go) or raw SQL  
**Migration Tool:** golang-migrate or GORM AutoMigrate

---

## 📊 Database Overview

### **Design Principles:**

- Normalized structure (3NF)
- Efficient indexing for common queries
- Scalable for growth
- Privacy-focused (user data isolation)
- Audit trails where needed

### **Core Tables:**

1. `users` - User accounts and authentication
2. `user_profiles` - Extended user information
3. `verses` - Cached Bible verses
4. `favorites` - User's favorite verses
5. `verse_history` - Reading history tracking
6. `daily_verses` - Daily verse rotation
7. `sessions` - User session management (optional)

---

## 🗄️ Complete Schema

### **Table 1: users**

**Purpose:** Core user authentication and account data

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires_at TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP -- Soft delete
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token);
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);

-- Constraints
ALTER TABLE users ADD CONSTRAINT chk_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
ALTER TABLE users ADD CONSTRAINT chk_username_length
    CHECK (username IS NULL OR LENGTH(username) >= 3);
```

**Fields Explained:**

- `id`: UUID for security (not sequential)
- `email`: Primary login identifier
- `username`: Optional display name
- `password_hash`: Bcrypt hashed password (never store plain text)
- `email_verified`: Email confirmation status
- `email_verification_token`: Token for email verification
- `password_reset_token`: Token for password reset
- `last_login_at`: Track user activity
- `deleted_at`: Soft delete (account recovery possible)

**Sample Data:**

```sql
INSERT INTO users (email, username, password_hash, email_verified) VALUES
('sarah@example.com', 'sarah_teacher', '$2a$10$...', TRUE),
('marcus@example.com', 'marcus_dev', '$2a$10$...', TRUE),
('grace@example.com', 'grace_grandma', '$2a$10$...', TRUE);
```

---

### **Table 2: user_profiles**

**Purpose:** Extended user information and preferences

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    preferred_translation VARCHAR(20) DEFAULT 'KJV',
    timezone VARCHAR(50) DEFAULT 'UTC',
    notification_enabled BOOLEAN DEFAULT FALSE,
    notification_time TIME DEFAULT '08:00:00',
    theme_preference VARCHAR(20) DEFAULT 'light', -- 'light', 'dark', 'auto'
    reading_streak_current INTEGER DEFAULT 0,
    reading_streak_longest INTEGER DEFAULT 0,
    last_read_date DATE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_last_read_date ON user_profiles(last_read_date);

-- Constraints
ALTER TABLE user_profiles ADD CONSTRAINT chk_preferred_translation
    CHECK (preferred_translation IN ('KJV', 'NIV', 'ESV', 'NLT', 'NKJV'));
ALTER TABLE user_profiles ADD CONSTRAINT chk_theme_preference
    CHECK (theme_preference IN ('light', 'dark', 'auto'));
```

**Fields Explained:**

- `user_id`: Foreign key to users table
- `preferred_translation`: Default Bible translation
- `timezone`: For daily verse timing
- `notification_enabled`: Email notification opt-in
- `notification_time`: Preferred notification time
- `reading_streak_current`: Current consecutive days
- `reading_streak_longest`: Personal best streak
- `last_read_date`: For streak calculation

**Sample Data:**

```sql
INSERT INTO user_profiles (user_id, first_name, preferred_translation, reading_streak_current) VALUES
((SELECT id FROM users WHERE email = 'sarah@example.com'), 'Sarah', 'KJV', 7),
((SELECT id FROM users WHERE email = 'marcus@example.com'), 'Marcus', 'NIV', 28),
((SELECT id FROM users WHERE email = 'grace@example.com'), 'Grace', 'KJV', 14);
```

---

### **Table 3: verses**

**Purpose:** Cache Bible verses from external API

```sql
CREATE TABLE verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference VARCHAR(100) NOT NULL, -- "John 3:16"
    book VARCHAR(50) NOT NULL,
    chapter INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    text TEXT NOT NULL,
    translation VARCHAR(20) NOT NULL DEFAULT 'KJV',
    api_verse_id VARCHAR(100), -- External API reference
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(reference, translation)
);

-- Indexes
CREATE INDEX idx_verses_reference ON verses(reference);
CREATE INDEX idx_verses_book ON verses(book);
CREATE INDEX idx_verses_translation ON verses(translation);
CREATE INDEX idx_verses_api_id ON verses(api_verse_id);
CREATE INDEX idx_verses_book_chapter ON verses(book, chapter);

-- Full-text search index
CREATE INDEX idx_verses_text_search ON verses USING gin(to_tsvector('english', text));

-- Constraints
ALTER TABLE verses ADD CONSTRAINT chk_chapter_positive
    CHECK (chapter > 0);
ALTER TABLE verses ADD CONSTRAINT chk_verse_positive
    CHECK (verse_number > 0);
```

**Fields Explained:**

- `reference`: Human-readable reference (e.g., "John 3:16")
- `book`: Bible book name
- `chapter`: Chapter number
- `verse_number`: Verse number within chapter
- `text`: Full verse text
- `translation`: Bible translation version
- `api_verse_id`: External API identifier for updates

**Sample Data:**

```sql
INSERT INTO verses (reference, book, chapter, verse_number, text, translation) VALUES
('John 3:16', 'John', 3, 16, 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.', 'KJV'),
('Psalm 23:1', 'Psalms', 23, 1, 'The LORD is my shepherd; I shall not want.', 'KJV'),
('Proverbs 3:5', 'Proverbs', 3, 5, 'Trust in the LORD with all thine heart; and lean not unto thine own understanding.', 'KJV'),
('Philippians 4:13', 'Philippians', 4, 13, 'I can do all things through Christ which strengtheneth me.', 'KJV');
```

---

### **Table 4: favorites**

**Purpose:** User's saved favorite verses

```sql
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verse_id UUID NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
    notes TEXT, -- Personal notes about the verse
    tags TEXT[], -- User-defined tags for organization
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, verse_id) -- Prevent duplicate favorites
);

-- Indexes
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_verse_id ON favorites(verse_id);
CREATE INDEX idx_favorites_created_at ON favorites(created_at DESC);
CREATE INDEX idx_favorites_tags ON favorites USING gin(tags);

-- Composite index for common query
CREATE INDEX idx_favorites_user_created ON favorites(user_id, created_at DESC);
```

**Fields Explained:**

- `user_id`: Who favorited the verse
- `verse_id`: Which verse was favorited
- `notes`: Personal reflections (optional)
- `tags`: Custom tags for organization (future feature)
- `created_at`: When favorited (for sorting)

**Sample Data:**

```sql
INSERT INTO favorites (user_id, verse_id, notes) VALUES
((SELECT id FROM users WHERE email = 'sarah@example.com'),
 (SELECT id FROM verses WHERE reference = 'John 3:16'),
 'My favorite verse - reminds me of God''s love'),
((SELECT id FROM users WHERE email = 'marcus@example.com'),
 (SELECT id FROM verses WHERE reference = 'Philippians 4:13'),
 'Motivation for tough days'),
((SELECT id FROM users WHERE email = 'grace@example.com'),
 (SELECT id FROM verses WHERE reference = 'Psalm 23:1'),
 'Brings me peace');
```

---

### **Table 5: verse_history**

**Purpose:** Track user's reading history

```sql
CREATE TABLE verse_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    verse_id UUID NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT NOW(),
    view_duration_seconds INTEGER, -- Optional: track engagement
    device_type VARCHAR(20) -- 'mobile', 'tablet', 'desktop'
);

-- Indexes
CREATE INDEX idx_verse_history_user_id ON verse_history(user_id);
CREATE INDEX idx_verse_history_verse_id ON verse_history(verse_id);
CREATE INDEX idx_verse_history_viewed_at ON verse_history(viewed_at DESC);
CREATE INDEX idx_verse_history_user_viewed ON verse_history(user_id, viewed_at DESC);

-- Composite index for date-based queries
CREATE INDEX idx_verse_history_user_date ON verse_history(user_id, DATE(viewed_at));
```

**Fields Explained:**

- `user_id`: Who viewed the verse
- `verse_id`: Which verse was viewed
- `viewed_at`: When viewed (timestamp)
- `view_duration_seconds`: Engagement metric (optional)
- `device_type`: Analytics data (optional)

**Sample Data:**

```sql
INSERT INTO verse_history (user_id, verse_id, viewed_at, device_type) VALUES
((SELECT id FROM users WHERE email = 'sarah@example.com'),
 (SELECT id FROM verses WHERE reference = 'John 3:16'),
 NOW() - INTERVAL '1 day', 'mobile'),
((SELECT id FROM users WHERE email = 'marcus@example.com'),
 (SELECT id FROM verses WHERE reference = 'Philippians 4:13'),
 NOW() - INTERVAL '2 hours', 'desktop'),
((SELECT id FROM users WHERE email = 'grace@example.com'),
 (SELECT id FROM verses WHERE reference = 'Psalm 23:1'),
 NOW() - INTERVAL '30 minutes', 'tablet');
```

**Auto-cleanup Old History:**

```sql
-- Delete history older than 90 days (run daily via cron)
DELETE FROM verse_history
WHERE viewed_at < NOW() - INTERVAL '90 days';
```

---

### **Table 6: daily_verses**

**Purpose:** Manage daily verse rotation

```sql
CREATE TABLE daily_verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verse_id UUID NOT NULL REFERENCES verses(id) ON DELETE CASCADE,
    date DATE UNIQUE NOT NULL,
    theme VARCHAR(100), -- Optional: 'Hope', 'Peace', 'Love', etc.
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(date)
);

-- Indexes
CREATE INDEX idx_daily_verses_date ON daily_verses(date DESC);
CREATE INDEX idx_daily_verses_verse_id ON daily_verses(verse_id);
CREATE INDEX idx_daily_verses_theme ON daily_verses(theme);
```

**Fields Explained:**

- `verse_id`: Which verse is featured
- `date`: The date this verse is shown
- `theme`: Optional thematic grouping
- Unique constraint ensures one verse per day

**Sample Data:**

```sql
INSERT INTO daily_verses (verse_id, date, theme) VALUES
((SELECT id FROM verses WHERE reference = 'John 3:16'), CURRENT_DATE, 'Love'),
((SELECT id FROM verses WHERE reference = 'Psalm 23:1'), CURRENT_DATE - 1, 'Peace'),
((SELECT id FROM verses WHERE reference = 'Philippians 4:13'), CURRENT_DATE - 2, 'Strength');
```

**Get Today's Verse:**

```sql
SELECT v.*
FROM verses v
JOIN daily_verses dv ON v.id = dv.verse_id
WHERE dv.date = CURRENT_DATE;
```

---

### **Table 7: sessions (Optional)**

**Purpose:** Manage user sessions and refresh tokens

```sql
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    user_agent TEXT,
    ip_address INET,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    last_used_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_refresh_token ON sessions(refresh_token);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Auto-cleanup expired sessions
DELETE FROM sessions WHERE expires_at < NOW();
```

**Fields Explained:**

- `user_id`: Session owner
- `refresh_token`: JWT refresh token
- `user_agent`: Browser/device info
- `ip_address`: Security tracking
- `expires_at`: Token expiration
- `last_used_at`: Activity tracking

---

## 🔗 Entity Relationships

```
users (1) ──────── (1) user_profiles
  │
  ├── (1) ──────── (many) favorites
  │                   │
  │                   └── (many) ──────── (1) verses
  │
  ├── (1) ──────── (many) verse_history
  │                   │
  │                   └── (many) ──────── (1) verses
  │
  └── (1) ──────── (many) sessions

verses (1) ──────── (many) daily_verses
```

**Relationship Types:**

- `users` → `user_profiles`: One-to-One
- `users` → `favorites`: One-to-Many
- `users` → `verse_history`: One-to-Many
- `users` → `sessions`: One-to-Many
- `verses` → `favorites`: One-to-Many
- `verses` → `verse_history`: One-to-Many
- `verses` → `daily_verses`: One-to-Many

---

## 📈 Common Queries

### **Query 1: Get User with Profile**

```sql
SELECT
    u.id,
    u.email,
    u.username,
    u.email_verified,
    u.last_login_at,
    p.first_name,
    p.last_name,
    p.preferred_translation,
    p.reading_streak_current,
    p.reading_streak_longest
FROM users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE u.email = 'sarah@example.com'
AND u.deleted_at IS NULL;
```

---

### **Query 2: Get User's Favorites with Verses**

```sql
SELECT
    v.reference,
    v.text,
    v.translation,
    f.notes,
    f.created_at as favorited_at
FROM favorites f
JOIN verses v ON f.verse_id = v.id
WHERE f.user_id = 'user-uuid-here'
ORDER BY f.created_at DESC
LIMIT 20 OFFSET 0; -- Pagination
```

---

### **Query 3: Get User's Reading History (Last 30 Days)**

```sql
SELECT
    v.reference,
    v.text,
    vh.viewed_at,
    vh.device_type
FROM verse_history vh
JOIN verses v ON vh.verse_id = v.id
WHERE vh.user_id = 'user-uuid-here'
AND vh.viewed_at >= NOW() - INTERVAL '30 days'
ORDER BY vh.viewed_at DESC;
```

---

### **Query 4: Get Today's Daily Verse**

```sql
SELECT
    v.id,
    v.reference,
    v.text,
    v.translation,
    dv.theme
FROM daily_verses dv
JOIN verses v ON dv.verse_id = v.id
WHERE dv.date = CURRENT_DATE;
```

---

### **Query 5: Check if Verse is Favorited**

```sql
SELECT EXISTS(
    SELECT 1
    FROM favorites
    WHERE user_id = 'user-uuid-here'
    AND verse_id = 'verse-uuid-here'
) as is_favorited;
```

---

### **Query 6: Get User Statistics**

```sql
SELECT
    u.email,
    p.reading_streak_current,
    p.reading_streak_longest,
    COUNT(DISTINCT f.id) as total_favorites,
    COUNT(DISTINCT vh.id) as total_verses_viewed,
    COUNT(DISTINCT DATE(vh.viewed_at)) as unique_days_read
FROM users u
LEFT JOIN user_profiles p ON u.id = p.user_id
LEFT JOIN favorites f ON u.id = f.user_id
LEFT JOIN verse_history vh ON u.id = vh.user_id
WHERE u.id = 'user-uuid-here'
GROUP BY u.id, u.email, p.reading_streak_current, p.reading_streak_longest;
```

---

### **Query 7: Search Verses (Full-Text)**

```sql
SELECT
    reference,
    text,
    translation,
    ts_rank(to_tsvector('english', text), query) as rank
FROM verses,
     to_tsquery('english', 'love & faith') as query
WHERE to_tsvector('english', text) @@ query
ORDER BY rank DESC
LIMIT 20;
```

---

### **Query 8: Update Reading Streak**

```sql
-- Check if user read today
WITH today_read AS (
    SELECT EXISTS(
        SELECT 1
        FROM verse_history
        WHERE user_id = 'user-uuid-here'
        AND DATE(viewed_at) = CURRENT_DATE
    ) as read_today
),
yesterday_read AS (
    SELECT EXISTS(
        SELECT 1
        FROM verse_history
        WHERE user_id = 'user-uuid-here'
        AND DATE(viewed_at) = CURRENT_DATE - 1
    ) as read_yesterday
)
UPDATE user_profiles
SET
    reading_streak_current = CASE
        WHEN (SELECT read_today FROM today_read) AND (SELECT read_yesterday FROM yesterday_read)
            THEN reading_streak_current + 1
        WHEN (SELECT read_today FROM today_read) AND NOT (SELECT read_yesterday FROM yesterday_read)
            THEN 1
        ELSE 0
    END,
    reading_streak_longest = GREATEST(reading_streak_longest, reading_streak_current + 1),
    last_read_date = CURRENT_DATE
WHERE user_id = 'user-uuid-here';
```

---

## 🔧 Database Functions

### **Function 1: Add Verse to History**

```sql
CREATE OR REPLACE FUNCTION add_verse_to_history(
    p_user_id UUID,
    p_verse_id UUID,
    p_device_type VARCHAR(20) DEFAULT 'unknown'
)
RETURNS UUID AS $$
DECLARE
    v_history_id UUID;
BEGIN
    INSERT INTO verse_history (user_id, verse_id, device_type)
    VALUES (p_user_id, p_verse_id, p_device_type)
    RETURNING id INTO v_history_id;

    RETURN v_history_id;
END;
$$ LANGUAGE plpgsql;
```

---

### **Function 2: Toggle Favorite**

```sql
CREATE OR REPLACE FUNCTION toggle_favorite(
    p_user_id UUID,
    p_verse_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_exists BOOLEAN;
BEGIN
    -- Check if favorite exists
    SELECT EXISTS(
        SELECT 1 FROM favorites
        WHERE user_id = p_user_id AND verse_id = p_verse_id
    ) INTO v_exists;

    IF v_exists THEN
        -- Remove favorite
        DELETE FROM favorites
        WHERE user_id = p_user_id AND verse_id = p_verse_id;
        RETURN FALSE; -- Unfavorited
    ELSE
        -- Add favorite
        INSERT INTO favorites (user_id, verse_id)
        VALUES (p_user_id, p_verse_id);
        RETURN TRUE; -- Favorited
    END IF;
END;
$$ LANGUAGE plpgsql;
```

---

## 🚀 Migration Scripts

### **Migration 001: Initial Schema**

```sql
-- migrations/001_initial_schema.up.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires_at TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMP,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deleted_at TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Add constraints
ALTER TABLE users ADD CONSTRAINT chk_email_format
    CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- ... (continue with other tables)
```

### **Migration 001: Rollback**

```sql
-- migrations/001_initial_schema.down.sql

DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS daily_verses CASCADE;
DROP TABLE IF EXISTS verse_history CASCADE;
DROP TABLE IF EXISTS favorites CASCADE;
DROP TABLE IF EXISTS verses CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

---

## 🔒 Security Considerations

### **1. Password Security**

```sql
-- Never store plain text passwords
-- Use bcrypt with cost factor 10-12
-- Example in Go:
-- hash, _ := bcrypt.GenerateFromPassword([]byte(password), 10)
```

### **2. SQL Injection Prevention**

```sql
-- Always use parameterized queries
-- Bad:  "SELECT * FROM users WHERE email = '" + email + "'"
-- Good: "SELECT * FROM users WHERE email = $1"
```

### **3. Data Privacy**

```sql
-- Soft delete for user accounts (30-day recovery)
UPDATE users SET deleted_at = NOW() WHERE id = 'user-uuid';

-- Permanent delete after 30 days
DELETE FROM users WHERE deleted_at < NOW() - INTERVAL '30 days';
```

### **4. Rate Limiting**

```sql
-- Track failed login attempts
CREATE TABLE login_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    attempted_at TIMESTAMP DEFAULT NOW(),
    success BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_login_attempts_email_time
    ON login_attempts(email, attempted_at);
```

---

## 📊 Performance Optimization

### **1. Index Strategy**

- Index all foreign keys
- Index frequently queried columns
- Composite indexes for common query patterns
- Full-text search indexes for verse text

### **2. Query Optimization**

```sql
-- Use EXPLAIN ANALYZE to check query performance
EXPLAIN ANALYZE
SELECT * FROM favorites
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```

### **3. Connection Pooling**

```go
// In Go application
db.SetMaxOpenConns(25)
db.SetMaxIdleConns(5)
db.SetConnMaxLifetime(5 * time.Minute)
```

### **4. Caching Strategy**

- Cache daily verse (24 hours)
- Cache user profile (5 minutes)
- Cache verse details (1 hour)
- Invalidate on updates

---

## 🧪 Test Data Script

```sql
-- test_data.sql
-- Populate database with test data for development

-- Insert test users
INSERT INTO users (email, username, password_hash, email_verified) VALUES
('test1@example.com', 'testuser1', '$2a$10$test_hash_1', TRUE),
('test2@example.com', 'testuser2', '$2a$10$test_hash_2', TRUE),
('test3@example.com', 'testuser3', '$2a$10$test_hash_3', TRUE);

-- Insert user profiles
INSERT INTO user_profiles (user_id, first_name, preferred_translation, reading_streak_current)
SELECT id, 'Test User ' || ROW_NUMBER() OVER (), 'KJV', 0
FROM users WHERE email LIKE 'test%';

-- Insert sample verses
INSERT INTO verses (reference, book, chapter, verse_number, text, translation) VALUES
('Genesis 1:1', 'Genesis', 1, 1, 'In the beginning God created the heaven and the earth.', 'KJV'),
('John 3:16', 'John', 3, 16, 'For God so loved the world...', 'KJV'),
('Psalm 23:1', 'Psalms', 23, 1, 'The LORD is my shepherd; I shall not want.', 'KJV');

-- Insert daily verses
INSERT INTO daily_verses (verse_id, date)
SELECT id, CURRENT_DATE - (ROW_NUMBER() OVER () - 1)
FROM verses
LIMIT 7;
```

---

## ✅ Schema Checklist

**Completed:**

- ✅ All tables defined
- ✅ Relationships established
- ✅ Indexes created
- ✅ Constraints added
- ✅ Common queries documented
- ✅ Migration scripts prepared
- ✅ Security considerations addressed
- ✅ Performance optimizations planned

**Next Steps:**

- ⏳ Create API_ENDPOINTS.md
- ⏳ Define backend API contracts
- ⏳ Plan Bible API integration

---

**Status:** ✅ Complete  
**Hours Completed:** 14 of 30  
**Next:** API_ENDPOINTS.md (Hours 15-16)

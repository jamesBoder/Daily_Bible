-- Community board seed: delete test/stale admin posts, insert real pinned content.
-- Idempotent: safe to run on every startup.
--   • The DELETE removes any admin posts whose body isn't one of the three seed bodies.
--     This clears test posts on first run and is a no-op on subsequent runs.
--   • Each INSERT is guarded by NOT EXISTS on the exact body text.

DELETE FROM community_posts
WHERE user_id IS NULL
  AND post_type IN ('announcement', 'challenge')
  AND deleted_at IS NULL
  AND body NOT IN (
    'Welcome to Words of Praise — a place to grow in faith, share reflections, and encourage one another. Every day is a new opportunity to walk in the Word.',
    'This week''s challenge: read the daily verse each morning before you check your phone. Share how it shapes your day in the community.',
    'Did you know your streak is your testimony? Every day you show up, you build a record of faithfulness. Don''t let it end — use a Grace Day if life gets in the way.'
  );

INSERT INTO community_posts (post_type, body, is_pinned, created_at, updated_at)
SELECT 'announcement',
       'Welcome to Words of Praise — a place to grow in faith, share reflections, and encourage one another. Every day is a new opportunity to walk in the Word.',
       TRUE,
       NOW(),
       NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM community_posts
  WHERE body = 'Welcome to Words of Praise — a place to grow in faith, share reflections, and encourage one another. Every day is a new opportunity to walk in the Word.'
    AND deleted_at IS NULL
);

INSERT INTO community_posts (post_type, body, is_pinned, created_at, updated_at)
SELECT 'challenge',
       'This week''s challenge: read the daily verse each morning before you check your phone. Share how it shapes your day in the community.',
       FALSE,
       NOW(),
       NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM community_posts
  WHERE body = 'This week''s challenge: read the daily verse each morning before you check your phone. Share how it shapes your day in the community.'
    AND deleted_at IS NULL
);

INSERT INTO community_posts (post_type, body, is_pinned, created_at, updated_at)
SELECT 'announcement',
       'Did you know your streak is your testimony? Every day you show up, you build a record of faithfulness. Don''t let it end — use a Grace Day if life gets in the way.',
       FALSE,
       NOW(),
       NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM community_posts
  WHERE body = 'Did you know your streak is your testimony? Every day you show up, you build a record of faithfulness. Don''t let it end — use a Grace Day if life gets in the way.'
    AND deleted_at IS NULL
);

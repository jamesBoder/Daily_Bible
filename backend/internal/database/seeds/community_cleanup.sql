-- community_cleanup.sql
-- Idempotent on every startup.
-- 1. Soft-delete posts whose body matches common profanity patterns (including
--    leet-speak variants the go-away filter may not have caught).
-- 2. Soft-delete ALL posts from the 'communitytest' test account.

-- ── 1. Profanity cleanup ──────────────────────────────────────────────────────
-- Matches: shit / sh1t / sh!t / s**t and fuck / f**k / f*ck / fck variants
UPDATE community_posts
SET    deleted_at = NOW()
WHERE  deleted_at IS NULL
  AND  (
         body ~* 'sh[1!i]t'
      OR body ~* 'f+[u*]+c+k*'
      OR body ~* '\bf[^a-z]*u[^a-z]*c[^a-z]*k'
  );

-- ── 2. Remove all posts by the communitytest user ────────────────────────────
UPDATE community_posts
SET    deleted_at = NOW()
WHERE  deleted_at IS NULL
  AND  user_id IN (
         SELECT id FROM users
         WHERE  username ILIKE 'communitytest'
           AND  deleted_at IS NULL
       );

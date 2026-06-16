# Daily Bible — Claude Code Instructions

## Architecture Overview

- **Frontend**: React + TypeScript (Vite), served by Nginx on port 80
- **Backend**: Go + Gin, running on port 18080 (internal Docker); exposed via Nginx `/api/*` proxy
- **Database**: PostgreSQL via GORM
- **Deployment**: Docker Compose (local) / Fly.io (production)

## Critical Conventions

### Frontend API Calls — `/api/` prefix is mandatory

**All** `apiClient` calls in `frontend/src/services/api/*.ts` must use the full `/api/<resource>` path.

```typescript
// CORRECT
apiClient.get('/api/manna/today')
apiClient.post('/api/community/posts')

// WRONG — causes 404
apiClient.get('/manna/today')
apiClient.post('/community/posts')
```

**Why:** `API_BASE_URL` resolves to the bare origin (e.g., `http://localhost`) with no path prefix. Nginx proxies `/api/*` to the backend. Omitting `/api/` hits Nginx directly and returns 404. This mistake has caused multiple launch failures (manna Phase 10, potentially others).

**How to verify:** Check `frontend/src/services/api/community.ts` — it correctly uses `/api/community` as the reference implementation.

### Backend Routes

All backend routes are registered under the `/api` group in `backend/internal/routes/routes.go`. Do not add routes outside this group unless they are infrastructure endpoints (e.g., `/health`).

### Database Migrations

Migrations run via GORM `AutoMigrate` in `backend/internal/database/migrations.go`. Add new models there. Never write raw `ALTER TABLE` migrations for schema changes — add the field to the model struct and GORM handles it.

### Seeding

Word banks and other seed data live in `backend/internal/database/seeds/`. The seeder uses `go:embed` and runs idempotently at startup (`ON CONFLICT DO NOTHING`).

### Premium Gating

Use `subscriptionChecker.IsPremium(userID)` to gate features. For local dev, set `DEV_PREMIUM_USER_IDS=<your-user-id>` in the backend environment to bypass Stripe.

### Daily Verse In-Process Cache — Never Mutate the Returned Pointer

`DailyVerseService.GetDailyVerse()` returns a `*models.Verse` pointer that is stored directly in the service's in-process memory cache (`s.cache.verse`). **Never write to any field of this pointer** after it is returned.

```go
// WRONG — mutates the shared cache, poisoning every subsequent request
verse.Text = translatedVerse.Text

// CORRECT — copy the value you need into a local variable
verseText := verse.Text
if resolvedVersion.ID != kjvVersionID {
    if translated, err := ...; err == nil {
        verseText = translated.Text
    }
}
// use verseText in the response, never touch verse.Text
```

**Why:** The cache holds a single pointer for the entire process lifetime of a day. Any mutation is immediately visible to all goroutines. If a Spanish-language request writes Spanish text into `verse.Text`, every subsequent English request reads Spanish from the cache until the server restarts. This bug caused the daily verse to display in a randomly-changing wrong language (French / Haitian Creole / Spanish) depending on which user's request hit the endpoint first after each server restart.

**How to verify:** After any change to `GetDailyVerse` or its callers, search for `verse\.Text\s*=` — there should be zero assignments in handler code.

### Sound Effects

All sounds are synthesized via Web Audio API in `frontend/src/services/SoundService.ts` — no audio files. Sounds are **off by default** and toggled via settings (stored in `localStorage`). To add a new sound cue: add the cue name to the `AudioCue` type, add a `case` in `play()`, and implement the private method.

### Daily Disciplines — Config-Driven Rotation, Idempotent Completion

Daily Disciplines are a 14-day rotating set of optional goals shown below the daily verse (`DisciplinesCard`). The catalogue and schedule are **config, not seed data** — they live in `backend/internal/config/disciplines.go`:

- `DisciplineDefinitions` — the catalogue: `Key`, `Blessings`, `Active`, `RequiresPremium`.
- `DisciplineRotation` — the ordered 14-day schedule (cycle length = `len(DisciplineRotation)`, never hardcoded elsewhere). Cycle day = `(date - epoch) % len`, pure UTC-10 date math against a fixed epoch (`2026-05-01`). **Do not change the epoch after launch** — it shifts every user's schedule.

Only completions are persisted: `models.UserDisciplineCompletion`, one row per `(UserID, DateUTC10, DisciplineKey)` with a composite unique index (added via GORM `AutoMigrate`).

**Completion is automatic and idempotent.** Action handlers (verse view, share, favorite, journal, reflection ≥50 words, annotation, plan advance, Manna solve) call `DisciplineService.TryComplete(userID, key, isPremium)` internally. `TryComplete` inserts the completion row with `OnConflict DoNothing` and credits blessings **only** when (a) a new row lands (`RowsAffected > 0`) and (b) the key is in today's rotation. Blessings are flat (multiplier `1.0`, no premium bonus) so the card's displayed `+N ✦` is always exact. Date boundary is **UTC-10**, like verse/Manna/streak resets.

Handlers return an optional `discipline_completed` field; the frontend invalidates the `['disciplines', 'today']` query to refresh the card. `POST /api/disciplines/:key/complete` is a manual fallback only — prefer the automatic hooks.

**To add a discipline:** append to `DisciplineDefinitions`, add its key to `DisciplineRotation` rows, add the i18n key under `disciplines.keys.*` in **all four** locale files (EN/ES/FR/HT), and call `TryComplete` from the relevant action handler.

## Git Workflow

### Branch Model

```
main          ← production; CD auto-deploys to Fly.io on every merge
  ↑ PR only (branch protection enforced)
dev           ← integration; all feature work merges here first
  ↑ PR only
feature/<name> ← one branch per feature, always cut from dev
```

`portfolio-mvp` is a standalone branch for the portfolio showcase — it has its own remote (`portfolio`) and is maintained separately from the `main`/`dev`/`feature` flow.

### Starting a Feature

```bash
git checkout dev && git pull origin dev
git checkout -b feature/<short-hyphenated-name>
# work, commit, push...
git push -u origin feature/<short-hyphenated-name>
# open PR → dev on GitHub
```

Branch names: `feature/<name>` with hyphens, lowercase. Hotfixes: `hotfix/<name>`.

### Before Opening a PR

```bash
# Smoke tests (requires Docker DB container running)
cd backend && go test ./test/ -run TestSmoke -v
# Build check
cd backend && go build ./internal/...
```

CI (`ci-backend.yml` / `ci-frontend.yml`) runs automatically on the PR and must pass before merging.

### Merging a Feature → dev

Regular GitHub PR merge. No deploy is triggered — `dev` is integration-only.

### Deploying to Production (dev → main)

1. Open PR `dev` → `main` on GitHub. Review the full diff — this is the release cut.
2. For large deploys (new DB columns, new auth flows), follow the pre-deploy steps in `docs/DEPLOYMENT_CHECKLIST.md` first (tag backup, DB dump, secrets check, local Docker build).
3. Merge the PR. `cd.yml` automatically deploys **backend first**, waits for it to be healthy, then deploys **frontend**.
4. Verify: `fly logs -a wordsofpraise-backend` — look for `Database connected and migrations completed successfully!`

### CI/CD Workflows (`.github/workflows/`)

| File | Trigger | What it does |
|------|---------|--------------|
| `ci-backend.yml` | PR touching `backend/**` | Go tests (unit + integration), security scan (gosec), format check, staticcheck |
| `ci-frontend.yml` | PR touching `frontend/**` | TypeScript check, ESLint, Jest, production build verify |
| `cd.yml` | Push to `main` | Deploy backend → 30s health wait → deploy frontend |

One GitHub secret is required: `FLY_API_TOKEN` (generate with `flyctl auth token`, add under repo Settings → Secrets → Actions).

### Stale Branches

The following branches are merged and can be deleted when convenient:
- `feature/emailVerification-passwordReset`
- `feature/growth-and-rewards`
- `feature/guest-mode`
- `feature/language-support`

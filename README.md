# Words of Praise — Daily Bible App

> A production-ready, full-stack web application delivering daily Bible verses with a rich, accessible user experience. Dedicated to Clairemena Jean-Pierre. ❤️

🌐 **Live:** [wordsofpraise-frontend.fly.dev](https://wordsofpraise-frontend.fly.dev)

[![Backend CI](https://github.com/jamesBoder/Daily_Bible/actions/workflows/ci-backend.yml/badge.svg)](https://github.com/jamesBoder/Daily_Bible/actions/workflows/ci-backend.yml)
[![Frontend CI](https://github.com/jamesBoder/Daily_Bible/actions/workflows/ci-frontend.yml/badge.svg)](https://github.com/jamesBoder/Daily_Bible/actions/workflows/ci-frontend.yml)
[![codecov](https://codecov.io/gh/jamesBoder/Daily_Bible/branch/main/graph/badge.svg)](https://codecov.io/gh/jamesBoder/Daily_Bible)

---

## ✨ Features

- 📖 **Daily Bible Verse** — Deterministic daily verse, updates at midnight, accessible without an account
- 🔐 **Authentication** — Email/password with verification flow, Google OAuth 2.0, JWT sessions; password & username recovery by email, rate-limited against brute force
- 👤 **Guest Mode** — Full browse experience without an account; session persists in `sessionStorage`
- ⭐ **Favorites** — One-click save/unsave with optimistic UI updates
- 💬 **Personal Reflections** — Private reflections per verse (up to 1,000 characters)
- 📜 **Verse History** — Navigate up to 30 days of past daily verses with back/forward arrows directly on the home screen (signed-in users only)
- 📤 **Share** — 6 channels: Copy, Twitter/X, WhatsApp, Facebook, Instagram, native Web Share API
- 🌍 **4 Languages** — English, Spanish, French, Haitian Creole (UI + Bible text via API.Bible)
- 🌙 **Dark Mode** — System preference detection with manual toggle
- 📱 **Mobile-First** — Responsive design, WCAG AA accessible, keyboard navigable

---

## 💻 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, React Query, i18next, React Router |
| **Backend** | Go 1.21+, Gin, GORM, PostgreSQL 15 |
| **Auth** | JWT (168h expiry), Google OAuth 2.0, Bcrypt (cost 12) |
| **Email** | Resend (verification & password reset) |
| **Bible API** | API.Bible (language-specific version IDs) |
| **Deployment** | Fly.io (frontend + backend), Docker Compose (local dev) |
| **CI/CD** | GitHub Actions — tests, security scan, bundle size check, Codecov coverage on every PR; auto-deploy with health-check rollback on merge to `main`; Dependabot for dependency updates |
| **Infra** | Nginx, Docker multi-stage builds, PostgreSQL Cloud |

---

## 🛠️ Local Development

The standard workflow is **hybrid**: PostgreSQL + backend run in Docker, frontend runs on the host with `npm start` for fast hot reload.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose v2
- Node.js 18+ and npm
- A `.env` file in the project root (see below)

### 1. Clone the Repository
```bash
git clone https://github.com/jamesboder/Daily_Bible.git
cd Daily_Bible
```

### 2. Configure Environment Variables

**Root `.env`** (read by Docker Compose — always run `docker compose` from the project root):
```env
# Database
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
POSTGRES_DB=your_db_name

# Auth
JWT_SECRET=your_jwt_secret_min_32_chars

# Trusted proxy CIDR for real client-IP detection (auth rate limiter).
# Local Docker only — trusts the nginx container. NEVER set this on Fly:
# the backend's peer is always the Fly proxy, so a CIDR would collapse all
# users onto one rate-limit bucket. (Prod uses the Fly-Client-IP header.)
TRUSTED_PROXIES=172.16.0.0/12

# Google OAuth — must point to the Docker backend port, not port 80
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URL=http://localhost:18080/api/auth/google/callback

# Frontend callback after OAuth
FRONTEND_URL=http://localhost:3000

# Bible API
BIBLE_API_KEY=your_api_bible_key
BIBLE_API_BASE_URL=https://rest.api.bible/v1
BIBLE_VERSION_ID=de4e12af7f28f599-02

# Email (Resend)
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=noreply@wordsofpraise.app

# Stripe (required at startup)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

**`frontend/.env`** (read by `npm start`):
```env
REACT_APP_API_URL=http://localhost:18080
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

**Google Cloud Console** — add these to your OAuth client:
- Authorized redirect URIs: `http://localhost:18080/api/auth/google/callback`
- Authorized JavaScript origins: `http://localhost:3000`

### 3. Start the App

**First run or after backend Go changes (rebuild image):**
```bash
docker compose up -d --build postgres backend
cd frontend && npm start
```

**Normal restart (no code changes):**
```bash
docker compose up -d postgres backend
cd frontend && npm start
```

**After Go changes only:**
```bash
docker compose up -d --build backend
```

> **Important:** Always run `docker compose` from the project root. Running it from `backend/` causes Docker to read `backend/.env` instead of the root `.env`, which sets the wrong ports.

### 4. Access the App

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:3000  |
| Backend  | http://localhost:18080 |
| Postgres | localhost:5433         |

---

## 📦 Project Structure

```
Daily_Bible/
├── backend/
│   ├── cmd/api/              # Application entry point
│   └── internal/
│       ├── handlers/         # HTTP request handlers
│       ├── services/         # Business logic
│       ├── repository/       # Data access layer
│       ├── models/           # Domain models
│       ├── middleware/       # Auth, CORS, logging
│       └── config/           # App & OAuth config
│
├── frontend/
│   └── src/
│       ├── components/       # Shared UI components
│       ├── features/         # Feature modules (auth, favorites, history, …)
│       ├── contexts/         # AuthContext, ThemeContext, LanguageContext
│       ├── hooks/            # Custom React hooks
│       ├── services/api/     # API client & service functions
│       └── i18n/             # Translation files (en, es, fr, ht)
│
├── docker-compose.yml
└── .env
```

---

## 🔐 Security

- **Email verification** required before login — unverified users receive HTTP 403 with a resend link
- **Password reset** via single-use 1-hour token (Resend); last 5 passwords blocked on reset
- **Google OAuth users** are auto-verified on all sign-in paths
- **Bcrypt** password hashing (cost factor 12)
- **JWT** tokens with 168-hour expiry
- **Guest sessions** use `sessionStorage` (cleared on tab close); 401 interceptor skips redirect for guests
- **User enumeration prevention** — forgot password, forgot username & resend verification always return generic responses
- **Rate limiting** — per-IP sliding window on auth endpoints (login, register, password reset, and email-senders); 429 + `Retry-After` when exceeded. Real client IP resolved from Fly's `Fly-Client-IP` header in production (spoof-resistant). Trips emit a WARN log + Sentry warning event for brute-force visibility
- Parameterized queries, CORS configuration, input validation on all endpoints

---

## 🚀 Deployment

The app is deployed on **Fly.io** as two separate apps:

| App | URL |
|---|---|
| Frontend | https://wordsofpraise-frontend.fly.dev |
| Backend | https://wordsofpraise-backend.fly.dev |

### Automated (normal path)

Merging a PR into `main` triggers the CD pipeline automatically:

1. `ci-backend.yml` and `ci-frontend.yml` must pass on the PR before it can merge
2. On merge, `cd.yml` deploys the backend first
3. The pipeline polls `/health` every 10s for up to 2 minutes — if the backend never responds healthy it **automatically rolls back** and the frontend deploy is skipped
4. Once the backend is confirmed healthy, the frontend deploys
5. A deployment summary (status, URL, timestamp, commit SHA) is written to the GitHub Actions job summary

No manual steps required.

### Manual (emergency / hotfix only)

```bash
cd backend && fly deploy
cd frontend && fly deploy
```

**Check status / logs:**
```bash
fly status -a wordsofpraise-backend
fly logs -a wordsofpraise-backend
```

Database migrations run automatically on backend startup via GORM `AutoMigrate`.

---

## 🧪 Testing

CI runs automatically on every PR. To run locally:

```bash
# Backend — unit + integration tests (requires Docker DB container running)
cd backend && go test ./internal/... -cover -count=1

# Backend — smoke tests
cd backend && go test ./test/... -run TestSmoke -v

# Frontend tests
cd frontend && npm test

# TypeScript type check
cd frontend && npm run typecheck

# Bundle size check
cd frontend && npx size-limit
```

Coverage is tracked automatically via Codecov — every PR gets a coverage delta comment showing whether coverage went up or down. Dependabot opens automated PRs weekly for outdated Go, npm, and GitHub Actions dependencies.

Tested across Chrome, Firefox, Safari, Edge, iOS Safari, and Android Chrome.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push and open a Pull Request

---

## 📝 License

MIT License

---

**Built with ❤️ in memory of Clairemena Jean-Pierre**

# Words of Praise — Daily Bible App

> A production-ready, full-stack web application delivering daily Bible verses with a rich, accessible user experience. Dedicated to Clairemena Jean-Pierre. ❤️

🌐 **Live:** [wordsofpraise-frontend.fly.dev](https://wordsofpraise-frontend.fly.dev)

[![Backend CI](https://github.com/jamesBoder/Daily_Bible/actions/workflows/ci-backend.yml/badge.svg)](https://github.com/jamesBoder/Daily_Bible/actions/workflows/ci-backend.yml)
[![Frontend CI](https://github.com/jamesBoder/Daily_Bible/actions/workflows/ci-frontend.yml/badge.svg)](https://github.com/jamesBoder/Daily_Bible/actions/workflows/ci-frontend.yml)

---

## ✨ Features

- 📖 **Daily Bible Verse** — Deterministic daily verse, updates at midnight, accessible without an account
- 🔐 **Authentication** — Email/password with verification flow, Google OAuth 2.0, JWT sessions
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
| **CI/CD** | GitHub Actions — tests + security scan on every PR, auto-deploy to Fly.io on merge to `main` |
| **Infra** | Nginx, Docker multi-stage builds, PostgreSQL Cloud |

---

## 🛠️ Local Development

The recommended way to run the app locally is with **Docker Compose** — it starts the frontend, backend, and PostgreSQL together.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- A `.env` file in the project root (see below)

### 1. Clone the Repository
```bash
git clone https://github.com/jamesboder/Daily_Bible.git
cd Daily_Bible
```

### 2. Configure Environment Variables
Create a `.env` file in the project root with the following:

```env
# Server
PORT=8080

# Database
DB_HOST=localhost
DB_PORT=5433
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
POSTGRES_DB=your_db_name

# Auth
JWT_SECRET=your_jwt_secret_min_32_chars

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URL=http://localhost/api/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost
REACT_APP_API_URL=http://localhost
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

# Bible API
BIBLE_API_KEY=your_api_bible_key
BIBLE_API_BASE_URL=https://rest.api.bible/v1

# Email (Resend) — use shared test sender for local dev
RESEND_API_KEY=re_xxxxxxxxxxxx
FROM_EMAIL=onboarding@resend.dev
```

> For Google OAuth locally, register `http://localhost/api/auth/google/callback` as an Authorized Redirect URI in Google Cloud Console.

### 3. Start the App

**First run or after major changes (full rebuild):**
```bash
docker-compose down -v && docker-compose up --build
```

**Normal restart (keeps database data):**
```bash
docker-compose down && docker-compose up --build
```

**Rebuild a single service:**
```bash
docker-compose up --build -d frontend   # after React/nginx changes
docker-compose up --build -d backend    # after Go changes
```

### 4. Access the App

| Service | URL |
|---|---|
| Frontend | http://localhost |
| API (via nginx) | http://localhost/api/... |
| PostgreSQL (host) | localhost:5433 |

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
- **User enumeration prevention** — forgot password & resend verification always return generic responses
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
2. On merge, `cd.yml` deploys the backend first, waits 30s for migrations to complete, then deploys the frontend

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
```

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

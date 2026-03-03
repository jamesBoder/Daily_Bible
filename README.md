# Words of Praise — Daily Bible App

> A full-stack web application for daily Bible verses with favorites, personal notes, and reading history tracking.
> Dedicated to my grandma, Clairemena Jean-Pierre, a child of God, who passed away last year. ❤️

> **Branch:** `portfolio-mvp` — A streamlined portfolio demonstration version.
> The full production app (with email verification, Google OAuth, and multi-language support) lives on the `main` branch.

---

## 🌐 Live Demo

🚀 **[Coming Soon — Deployment in Progress](#)**

> Will be deployed with Docker on a VPS / cloud platform.

---

## 🌟 Features

### Core Features
- 📖 **Daily Bible Verse** — New inspirational verse every day, powered by API.Bible
- 🔐 **User Authentication** — Secure email/password registration and login (no email verification required)
- 👤 **Guest Mode** — Explore the full app without creating an account; session persists across refresh
- ⭐ **Favorites System** — Save and organize your favorite verses
- 💬 **Personal Notes** — Add private comments and reflections to any verse
- 📜 **Reading History** — Automatic tracking of viewed verses with a chronological history view
- 👤 **User Profiles** — View account info and activity statistics
- 🌙 **Dark Mode** — Comfortable reading experience day or night
- 📱 **Mobile Responsive** — Clean, readable layout on all screen sizes
- 🔒 **Password Strength Indicator** — Real-time visual feedback during registration

---

## 💻 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **React Query** (`@tanstack/react-query`) for data fetching and caching
- **React Router v6** for navigation
- **React Hot Toast** for notifications
- **Axios** for HTTP requests

### Backend
- **Go** with **Gin** framework
- **PostgreSQL 15** database
- **JWT** authentication
- **GORM** for database ORM
- **API.Bible** for Bible verse content

### Infrastructure
- **Docker** + **docker-compose** — full local stack in one command
- **nginx** — reverse proxy serving the React app and routing `/api/*` to the Go backend

---

## 🚀 Getting Started (Docker — Recommended)

The entire stack (frontend, backend, database) runs with a single command.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- A [Bible API key](https://scripture.api.bible) (free)

### 1. Clone the Repository
```bash
git clone -b portfolio-mvp https://github.com/jamesboder/Daily_Bible.git
cd Daily_Bible
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
```

Open `.env` and fill in:
```env
# Database (pick any local values)
DB_USER=dailybible_user
DB_PASSWORD=your_password_here
DB_NAME=dailybible_db
POSTGRES_DB=dailybible_db        # must match DB_NAME

# Auth (any random 32+ char string)
JWT_SECRET=your_jwt_secret_here

# Bible API (required for verse content)
BIBLE_API_KEY=your_bible_api_key_here
```

> All other values in `.env.example` have working defaults for local Docker.

### 3. Start the Stack
```bash
# First time (or after major changes) — wipes database volume:
docker-compose down -v && docker-compose up --build

# Normal restart (keeps database data):
docker-compose down && docker-compose up --build
```

### 4. Open the App
| Service | URL |
|---------|-----|
| App (frontend) | http://localhost |
| API (via nginx) | http://localhost/api/... |
| Postgres (host) | localhost:5433 |

---

## 📦 Project Structure

```
Daily_Bible/
├── backend/
│   ├── cmd/api/              # Main application entry point
│   ├── internal/
│   │   ├── handlers/         # HTTP request handlers
│   │   ├── models/           # Database models (User, Verse, Favorite, History, Comment)
│   │   ├── services/         # Business logic
│   │   │   ├── auth_service.go
│   │   │   ├── bible_api_service.go
│   │   │   ├── daily_verse_service.go
│   │   │   └── ...
│   │   ├── repository/       # Data access layer
│   │   ├── middleware/       # JWT auth, CORS, logger, error handler
│   │   └── config/           # App configuration
│   ├── Dockerfile
│   └── go.mod
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Button, Input, PasswordInput, Loading, Card, ...
│   │   │   └── layout/       # Header, Footer, Layout
│   │   ├── features/
│   │   │   ├── auth/         # Login, Signup
│   │   │   ├── verse/        # DailyVerse, VerseCard, CommentSection
│   │   │   ├── favorites/    # FavoritesList
│   │   │   ├── history/      # HistoryList
│   │   │   ├── profile/      # Profile, Settings, AccountManagement
│   │   │   └── about/        # About page
│   │   ├── contexts/         # AuthContext, ThemeContext
│   │   ├── hooks/            # useAuth, useFavorites, useHistory, useVerse, ...
│   │   ├── services/api/     # Axios API clients (auth, verse, favorites, history, ...)
│   │   └── utils/            # constants, helpers, retry, toast
│   ├── nginx.conf            # Local Docker nginx config
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml        # Full local stack definition
├── .env.example              # Environment variables template
├── DOCKER_LOCAL_DEV.md       # Local Docker troubleshooting guide
└── README.md
```

---

## 🔐 Security

- **JWT authentication** with secure token storage in `localStorage`
- **Bcrypt** password hashing (cost factor 12)
- **Real-time password strength validation** — 5-rule indicator shown during signup
- **Guest session safety** — 401 responses never redirect guest users to login
- **SQL injection prevention** via parameterized queries (GORM)
- **XSS protection** and input sanitization
- **CORS** properly configured per environment

---

## 🎯 Feature Details

### Daily Verse
- Same verse for all users on the same day
- Updates automatically in the early morning (UTC) without needing a page refresh
- Accessible without login (public endpoint with optional auth)

### User Authentication
- Email and password registration — immediate login after signup (no email verification step)
- Session persistence with JWT stored in `localStorage`
- Secure logout clears all stored credentials

### Guest Mode
- "Continue as Guest" on the login page
- Full daily verse access, no account required
- Restricted pages (Favorites, History, Profile) redirect to `/daily` with a toast notification
- Session persists across page refreshes via `sessionStorage`

### Favorites System
- One-click save to favorites from the daily verse card
- Organized favorites list with card pop-out interaction
- Remove favorites easily

### Personal Notes
- Add private reflections to any verse
- Edit or delete comments anytime
- 1000 character limit

### Reading History
- Automatic tracking of every verse viewed
- Chronological history view with card pop-out interaction
- Clear history option

---

## 🧪 Testing

### Backend Tests
```bash
cd backend && go test ./...
```

### Manual Testing Checklist (verified locally)
- ✅ Registration → immediate login (no email step)
- ✅ Login / Logout
- ✅ Guest mode (full verse access, restricted pages redirect)
- ✅ Daily verse displays correctly
- ✅ Favorites (add, view, remove)
- ✅ Reading history (auto-tracked, clearable)
- ✅ Personal notes (add, edit, delete)
- ✅ Dark mode toggle (persists across sessions)
- ✅ Settings save
- ✅ Mobile responsive layout
- ✅ Password strength indicator (real-time, 5 rules)

---

## 📊 Performance

- **React Query** caching — avoids redundant API calls
- **PasswordInput** requirements computed directly from props (no `useState`/`useEffect`)
- **Lazy loading** for route-level code splitting
- **nginx** serves the static React build with gzip compression

---

## 🚀 Deployment

This branch is designed for Docker-based deployment on any VPS or cloud platform.

```bash
# On your server:
git clone -b portfolio-mvp https://github.com/jamesboder/Daily_Bible.git
cd Daily_Bible
cp .env.example .env
# Fill in .env values
docker-compose up --build -d
```


---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Dedicated to **Clairemena Jean-Pierre**, whose love for God's Word inspired this project ❤️
- Built with love for those seeking daily spiritual inspiration
- Designed for simplicity — accessible to people who don't normally use apps

## 📞 Contact

- Email: wordsofpraiseapp@gmail.com
- Instagram: [@wordsofpraiseapp](https://www.instagram.com/wordsofpraiseapp)
- GitHub Issues: open an issue on this repository

---

**Built with ❤️ in memory of Clairemena Jean-Pierre**

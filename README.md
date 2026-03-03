# Words of Praise - Daily Bible App

> A modern web application for daily Bible verses with favorites, comments, and history tracking. Dedicated to my grandma, Clairemena Jean-Pierre, a child of God, who passed away last year. ❤️

## 🌐 Live Demo

🚀 **[https://wordsofpraise-frontend.fly.dev](https://wordsofpraise-frontend.fly.dev)**

> Deployed on Fly.io with automatic SSL, global CDN, and auto-scaling.

---

## 🌟 Features

### Core Features
- 📖 **Daily Bible Verse** - New inspirational verse every day at midnight
- 🔐 **User Authentication** - Secure login with email or Google OAuth
- ✉️ **Email Verification** - Secure signup flow with email confirmation via Resend
- 🔑 **Password Reset** - Forgot password flow with time-limited reset tokens (1 hour)
- 👤 **Guest Mode** - Explore the app without an account; session persists across refresh
- ⭐ **Favorites System** - Save and organize your favorite verses
- 💬 **Personal Notes** - Add comments and reflections to verses
- 📜 **Reading History** - Track your spiritual journey with automatic history
- 👤 **User Profiles** - Manage your account and view activity statistics
- 🌙 **Dark Mode** - Comfortable reading experience day or night
- 📱 **Mobile Responsive** - Beautiful on all devices
- 🌍 **Multi-Language Support** - UI and Bible verses in English, Spanish, French, and Haitian Creole

### Additional Features
- 📤 **Multi-Platform Share** - Share verses via Copy, Twitter/X, WhatsApp, Facebook, Instagram, or native share sheet
- 🔍 Search functionality for verses
- 📊 Personal statistics and activity tracking
- 🎨 Clean, minimal design focused on readability
- ℹ️ **About Page** - Mission, features, dedication, and contact information

## 💻 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **React Query** for data fetching and caching
- **React Router** for navigation
- **React Hot Toast** for notifications
- **i18next** for internationalization (4 languages)

### Backend
- **Go** with Gin framework
- **PostgreSQL** database
- **JWT** authentication
- **Google OAuth 2.0** integration
- **GORM** for database ORM
- **Resend** for transactional email (verification & password reset)

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+
- Go 1.21+
- PostgreSQL 15+
- Git

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/jamesboder/Daily_Bible.git
cd Daily_Bible
```

#### 2. Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
# Required variables:
# - DB_USER, DB_PASSWORD (PostgreSQL credentials)
# - JWT_SECRET (minimum 32 characters)
# - GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET (for OAuth)
# - RESEND_API_KEY (for email verification & password reset)
# - FROM_EMAIL (sender address, e.g. noreply@wordsofpraise.app)
# - FRONTEND_URL (e.g. http://localhost:3000 for local dev)
```

#### 3. Backend Setup
```bash
cd backend

# Install dependencies
go mod download

# Run database migrations
go run cmd/migrate/main.go

# Start the backend server
go run cmd/api/main.go
# Server runs on http://localhost:8080
```

#### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm start
# App runs on http://localhost:3000
```

## 📦 Project Structure

```
Daily_Bible/
├── backend/
│   ├── cmd/
│   │   └── api/              # Main application entry point
│   ├── internal/
│   │   ├── handlers/         # HTTP request handlers
│   │   ├── models/           # Database models
│   │   ├── services/         # Business logic
│   │   │   ├── email_service.go        # Resend email (verification & reset)
│   │   │   ├── auth_service.go
│   │   │   ├── bible_api_service.go
│   │   │   └── ...
│   │   ├── repository/       # Data access layer
│   │   ├── middleware/       # HTTP middleware
│   │   └── config/           # App configuration
│   └── go.mod
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── features/
│   │   │   ├── auth/         # Login, Signup, VerifyEmail, ForgotPassword, ResetPassword
│   │   │   ├── verse/        # DailyVerse, VerseCard, CommentSection
│   │   │   ├── favorites/    # FavoritesList
│   │   │   ├── history/      # HistoryList
│   │   │   ├── profile/      # Profile, Settings, AccountManagement, GuestAccountManagement
│   │   │   └── about/        # About page
│   │   ├── contexts/         # AuthContext, ThemeContext, LanguageContext
│   │   ├── hooks/            # Custom React hooks
│   │   ├── i18n/             # Translations (en, es, fr, ht)
│   │   ├── services/         # API services
│   │   └── utils/            # Utility functions
│   ├── public/
│   └── package.json
│
├── docs/                     # Feature plans and implementation guides
├── docker-compose.yml
├── .env.example              # Environment variables template
└── README.md
```

## 🔧 Available Scripts

### Backend Commands
```bash
# Run development server
go run cmd/api/main.go

# Run tests
go test ./...

# Build for production
go build -o main cmd/api/main.go

# Run database migrations
go run cmd/migrate/main.go
```

### Frontend Commands
```bash
# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build

# Analyze bundle size
npm run analyze

# Run linting
npm run lint
```

## 🧪 Testing

### Running Tests
```bash
# Backend tests
cd backend && go test ./...

# Frontend tests
cd frontend && npm test
```

### Manual Testing
The application has been tested for:
- ✅ Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- ✅ Mobile responsiveness (iOS, Android)
- ✅ Accessibility (WCAG AA compliance)
- ✅ Performance optimization
- ✅ Security best practices
- ✅ Email verification flow (signup → verify → login)
- ✅ Password reset flow (forgot → email → reset → login)
- ✅ Guest mode (browse → upgrade to account)
- ✅ Multi-language switching (en, es, fr, ht)
- ✅ Share feature across all platforms

## 📊 Performance

The application is optimized for:
- **Fast Loading**: < 2 seconds initial load
- **Responsive UI**: 60 FPS animations
- **Efficient Caching**: React Query for data management
- **Code Splitting**: Lazy loading for better performance
- **Mobile First**: Optimized for mobile devices

## 🔐 Security Features

- JWT-based authentication with secure token storage
- **Email verification** required before login (HTTP 403 + machine-readable `EMAIL_NOT_VERIFIED` code)
- **Password reset** with 1-hour expiring tokens (single-use, cleared after use)
- **Password history** — last 5 passwords blocked on reset
- Bcrypt password hashing (cost factor 12)
- Secure session management
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- XSS protection
- CORS properly configured
- **User enumeration prevention** — forgot password & resend verification always return generic messages
- Google OAuth users auto-verified (`email_verified = true`)

## 🎯 Core Features Overview

### Daily Verse
- Automatically updates at midnight using a deterministic MD5 date-hash algorithm
- Beautiful card display with verse text and reference
- Works without login for public access (OptionalAuthMiddleware)
- Share panel always visible below the Favorite button

### User Authentication
- Email and password registration with **email verification** (Resend)
- Google OAuth integration (pre-verified, skips email flow)
- **Forgot password** and **reset password** flows with 1-hour tokens
- Session persistence with JWT

### Guest Mode
- "Continue as Guest" button on the login page
- Full daily verse access without an account
- Restricted pages (Favorites, History, Profile) redirect to `/daily` with a toast
- Session persists across page refreshes via `sessionStorage`
- Seamless upgrade to a real account at any time

### Multi-Language Support
- UI and Bible verses available in **English, Spanish, French, and Haitian Creole**
- Language preference saved per user (or in localStorage for guests)
- Powered by API.Bible with language-specific Bible version IDs
- i18next for frontend translations

### Favorites System
- One-click save to favorites
- Organized favorites list with card pop-out interaction
- Share panel revealed on card click (progressive disclosure)
- Remove favorites easily

### Comments & Notes
- Add personal reflections to any verse
- Private notes visible only to you
- Edit or delete comments anytime
- Character limit for optimal display (1000 chars)

### Reading History
- Automatic tracking of viewed verses
- Chronological history view with card pop-out interaction
- Clear history option
- Privacy-focused design

### Multi-Platform Share
- **6 share channels**: Copy 📋, Twitter/X 🐦, WhatsApp 💬, Facebook 📘, Instagram 📸, Native Share 📤
- App signature appended: `"verse text" — Reference (Version)\n\nvia Words of Praise app`
- Copy feedback: button turns green with checkmark for 2 seconds
- Web Share API shown only on supported browsers (iOS Safari, Android Chrome)
- Progressive disclosure on Favorites & History pages (revealed on card click)

## 🚀 Deployment

The application is deployed on **Fly.io**:

| Service | URL |
|---------|-----|
| Frontend | https://wordsofpraise-frontend.fly.dev |
| Backend | https://wordsofpraise-backend.fly.dev |

**Infrastructure:**
- Automatic SSL/TLS certificates
- Global CDN distribution
- Auto-scaling (min: 0, max: 10 machines)
- Health check monitoring
- Zero-downtime deployments
- PostgreSQL Cloud with automated backups

See [`docs/FLY_IO_DEPLOYMENT_GUIDE.md`](docs/FLY_IO_DEPLOYMENT_GUIDE.md) for full deployment instructions.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Dedicated to Clairemena Jean-Pierre, whose love for God's Word inspired this project
- Built with love for those seeking daily spiritual inspiration
- Designed for simplicity - targeting people who normally don't use apps
- Special thanks to all contributors and testers

## 📞 Support

For issues, questions, or suggestions:
- Open a GitHub issue
- Submit a pull request with improvements
- Email: wordsofpraiseapp@gmail.com
- Instagram: [@wordsofpraiseapp](https://www.instagram.com/wordsofpraiseapp)

## 🎯 Project Vision

This project was created to:
- Provide a simple, accessible Bible experience
- Help people experience the Bible through modern technology
- Honor the memory of Clairemena Jean-Pierre
- Build a tool that's functional and easy to use - simplicity first

### Current Status: Production Live ✅
- ✅ Daily verse display (deterministic algorithm)
- ✅ User authentication (email + Google OAuth)
- ✅ Email verification & password reset (Resend)
- ✅ Guest mode (sessionStorage-persisted)
- ✅ Favorites and history tracking
- ✅ Comments and notes system
- ✅ Multi-platform share (6 channels)
- ✅ Multi-language support (en, es, fr, ht)
- ✅ About page with contact & dedication
- ✅ Mobile responsive design
- ✅ Dark mode support
- ✅ Deployed on Fly.io with auto-scaling

### Future Enhancements
- 🎮 Daily Reading Streaks & Gamification (points, achievements, badges, leaderboards)
- 📖 Multiple Bible translations (NIV, ESV, NLT)
- 📅 Structured reading plans
- 🔔 Push notifications & daily reminders
- 📱 Progressive Web App (PWA) with offline support
- 🤖 AI-powered personalized verse recommendations
- 💬 Disqus public commenting system
- 📧 Newsletter signup for weekly devotionals

---

**Built with ❤️ in memory of Clairemena Jean-Pierre**
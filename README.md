# Words of Praise - Daily Bible App

> A modern web application for daily Bible verses with favorites, comments, and history tracking. Dedicated to my grandma, Clairemena Jean-Pierre, a child of God, who passed away last year. ❤️

## 🌟 Features

### Core Features
- 📖 **Daily Bible Verse** - New inspirational verse every day at midnight
- 🔐 **User Authentication** - Secure login with email or Google OAuth
- ⭐ **Favorites System** - Save and organize your favorite verses
- 💬 **Personal Notes** - Add comments and reflections to verses
- 📜 **Reading History** - Track your spiritual journey with automatic history
- 👤 **User Profiles** - Manage your account and view activity statistics
- 🌙 **Dark Mode** - Comfortable reading experience day or night
- 📱 **Mobile Responsive** - Beautiful on all devices

### Additional Features
- 🔗 Share verses with friends and family
- 🔍 Search functionality for verses
- 📊 Personal statistics and reading streaks
- 🎨 Clean, minimal design focused on readability

## 💻 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS** for styling
- **React Query** for data fetching and caching
- **React Router** for navigation
- **React Hot Toast** for notifications

### Backend
- **Go** with Gin framework
- **PostgreSQL** database
- **JWT** authentication
- **Google OAuth 2.0** integration
- **GORM** for database ORM

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
│   │   └── api/          # Main application entry point
│   ├── internal/
│   │   ├── handlers/     # HTTP request handlers
│   │   ├── models/       # Database models
│   │   ├── services/     # Business logic
│   │   └── middleware/   # HTTP middleware
│   ├── pkg/              # Reusable packages
│   └── go.mod
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── features/     # Feature-specific components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom React hooks
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   ├── public/
│   └── package.json
│
├── .env.example          # Environment variables template
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

## 📊 Performance

The application is optimized for:
- **Fast Loading**: < 2 seconds initial load
- **Responsive UI**: 60 FPS animations
- **Efficient Caching**: React Query for data management
- **Code Splitting**: Lazy loading for better performance
- **Mobile First**: Optimized for mobile devices

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Bcrypt password hashing
- Secure session management
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS properly configured

## 🎯 Core Features Overview

### Daily Verse
- Automatically updates at midnight
- Beautiful card display with verse text and reference
- Works without login for public access

### User Authentication
- Email and password registration
- Google OAuth integration
- Secure password reset functionality
- Session persistence

### Favorites System
- One-click save to favorites
- Organized favorites list
- Search within favorites
- Remove favorites easily

### Comments & Notes
- Add personal reflections to any verse
- Private notes visible only to you
- Edit or delete comments anytime
- Character limit for optimal display

### Reading History
- Automatic tracking of viewed verses
- Chronological history view
- Clear history option
- Privacy-focused design

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

## 🎯 Project Vision

This project was created to:
- Provide a simple, accessible Bible experience
- Help people experience the Bible through modern technology
- Honor the memory of Clairemena Jean-Pierre
- Build a tool that's functional and easy to use - simplicity first

### Current Status: MVP Complete ✅
- Daily verse display
- User authentication system
- Favorites and history tracking
- Comments and notes system
- Mobile responsive design
- Dark mode support

### Future Enhancements
- Multiple Bible translations
- Advanced search functionality
- Reading plans and streaks
- Prayer journal features
- Verse sharing enhancements
- Offline support

---

**Built with ❤️ in memory of Clairemena Jean-Pierre**
# 📅 Bible Verse a Day App - 30 Hour Planning Schedule

## 🎯 **Goal: Complete Planning Phase Ready for Development**

---

## 📊 **Schedule Overview**

**Total Time:** 30 hours  
**Timeline:** 6 days (5 hours/day) or 3 days (10 hours/day)  
**Outcome:** Complete project blueprint ready for coding

---

## 🗓️ **Detailed 30-Hour Breakdown**

### **DAY 1: Foundation & Decisions (6 hours)**

#### **Hour 1-2: Project Definition & Goals**
**Tasks:**
- [ ] Define app purpose and target audience
- [ ] Write project vision statement
- [ ] List core problems you're solving
- [ ] Define success metrics

**Deliverables:**
- `docs/PROJECT_VISION.md` - One-page vision document
- Clear understanding of "why" you're building this

**Questions to Answer:**
- Who is this app for?
- What problem does it solve?
- What makes it different from existing apps?
- What's the #1 feature that must work perfectly?

---

#### **Hour 3-4: Technology Stack Decision**
**Tasks:**
- [ ] Choose frontend framework (React recommended)
- [ ] Choose backend framework (Go - you know it!)
- [ ] Choose database (PostgreSQL recommended)
- [ ] Choose hosting platform (Vercel + Railway)
- [ ] Choose Bible API (API.Bible or Bible API)

**Deliverables:**
- `docs/TECH_STACK.md` - Technology decisions with rationale

**Recommended Stack:**
```
Frontend: React + TypeScript + Tailwind CSS
Backend: Go + Gin framework
Database: PostgreSQL
Auth: JWT tokens
API: API.Bible (free tier)
Hosting: Vercel (frontend) + Railway (backend)
```

**Why This Stack:**
- You already know Go (backend)
- React is most popular (jobs, community)
- PostgreSQL is production-ready
- All have free tiers for MVP
- Can scale when needed

---

#### **Hour 5-6: Project Structure Setup**
**Tasks:**
- [ ] Design folder structure
- [ ] Create project structure document
- [ ] Plan reusable components
- [ ] Identify what can be copied from BeerInfoApp

**Deliverables:**
- `docs/PROJECT_STRUCTURE.md` - Complete folder layout

**Reusable from BeerInfoApp:**
```
✅ Authentication system (login/logout)
✅ User state management
✅ Favorites system architecture
✅ History tracking pattern
✅ Storage layer design
✅ API client pattern
✅ Error handling
✅ Configuration management
```

---

### **DAY 2: Features & User Experience (6 hours)**

#### **Hour 7-8: Feature Definition**
**Tasks:**
- [ ] List ALL possible features (brainstorm)
- [ ] Categorize: Must Have, Should Have, Could Have, Won't Have
- [ ] Define MVP features (minimum for launch)
- [ ] Create feature priority list

**Deliverables:**
- `docs/FEATURES.md` - Complete feature list with priorities

**MVP Features (Must Have):**
1. **Authentication**
   - Sign up with email
   - Login
   - Logout
   - Password reset

2. **Daily Verse**
   - Display verse of the day
   - Show reference (book, chapter, verse)
   - Show translation
   - Beautiful card design

3. **Favorites**
   - Save favorite verses
   - View all favorites
   - Remove from favorites
   - Search favorites

4. **History**
   - Track viewed verses
   - View history list
   - Clear history

5. **Basic Profile**
   - View profile
   - Edit name/email
   - Change password

**Post-MVP Features (Phase 2):**
- Multiple translations
- Share verse (social media)
- Daily notifications
- Reading plans
- Search all verses
- Comments/reflections
- Dark mode

---

#### **Hour 9-10: User Stories & Flows**
**Tasks:**
- [ ] Create user personas (2-3 types)
- [ ] Write user stories for each feature
- [ ] Map user journeys
- [ ] Identify pain points to solve

**Deliverables:**
- `docs/USER_STORIES.md` - All user stories

**Example User Stories:**

**As a daily Bible reader:**
- I want to see a new verse each day so I can start my morning with inspiration
- I want to save my favorite verses so I can revisit them later
- I want to track my reading history so I can see my progress

**As a casual visitor:**
- I want to quickly see today's verse without signing up
- I want to share verses with friends easily
- I want a simple, beautiful interface

**User Journey Example:**
```
1. User visits app → Sees today's verse (no login required)
2. User likes verse → Prompted to sign up to save it
3. User signs up → Verse automatically saved
4. User returns daily → Sees new verse, builds collection
5. User shares verse → Friends discover app
```

---

#### **Hour 11-12: UI/UX Design Planning**
**Tasks:**
- [ ] Sketch main screens (paper/digital)
- [ ] Define color scheme
- [ ] Choose fonts
- [ ] Plan responsive layouts
- [ ] Create design system basics

**Deliverables:**
- `docs/DESIGN_SYSTEM.md` - Colors, fonts, spacing
- Sketches of 5 main screens

**Screens to Design:**
1. Home (Daily Verse)
2. Favorites List
3. History List
4. Profile
5. Login/Signup

**Design Inspiration:**
- Clean, minimal design
- Focus on the verse (hero element)
- Calming colors (blues, purples, earth tones)
- Large, readable text
- Beautiful background images

---

### **DAY 3: Database & API Design (6 hours)**

#### **Hour 13-14: Database Schema Design**
**Tasks:**
- [ ] Design all database tables
- [ ] Define relationships
- [ ] Plan indexes
- [ ] Create migration strategy

**Deliverables:**
- `docs/DATABASE_SCHEMA.md` - Complete schema with SQL

**Core Tables:**

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User profiles
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Verses (cache from API)
CREATE TABLE verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference VARCHAR(100) NOT NULL, -- "John 3:16"
    book VARCHAR(50) NOT NULL,
    chapter INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    text TEXT NOT NULL,
    translation VARCHAR(20) DEFAULT 'KJV',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(reference, translation)
);

-- Favorites
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    verse_id UUID REFERENCES verses(id) ON DELETE CASCADE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, verse_id)
);

-- History
CREATE TABLE verse_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    verse_id UUID REFERENCES verses(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP DEFAULT NOW()
);

-- Daily verses (for consistency)
CREATE TABLE daily_verses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verse_id UUID REFERENCES verses(id),
    date DATE UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_history_user ON verse_history(user_id);
CREATE INDEX idx_history_date ON verse_history(viewed_at);
CREATE INDEX idx_daily_verses_date ON daily_verses(date);
```

---

#### **Hour 15-16: API Endpoint Design**
**Tasks:**
- [ ] List all API endpoints needed
- [ ] Define request/response formats
- [ ] Plan error handling
- [ ] Document authentication flow

**Deliverables:**
- `docs/API_ENDPOINTS.md` - Complete API documentation

**API Endpoints:**

**Authentication:**
```
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

**Verses:**
```
GET    /api/v1/verses/daily          # Get today's verse
GET    /api/v1/verses/random         # Get random verse
GET    /api/v1/verses/:id            # Get specific verse
GET    /api/v1/verses/search?q=love  # Search verses
```

**Favorites:**
```
GET    /api/v1/favorites             # Get user's favorites
POST   /api/v1/favorites             # Add to favorites
DELETE /api/v1/favorites/:id         # Remove from favorites
```

**History:**
```
GET    /api/v1/history               # Get user's history
POST   /api/v1/history               # Add to history
DELETE /api/v1/history               # Clear history
```

**User:**
```
GET    /api/v1/user/profile          # Get profile
PUT    /api/v1/user/profile          # Update profile
PUT    /api/v1/user/password         # Change password
```

**Request/Response Format:**
```json
// Success Response
{
  "success": true,
  "data": {
    "verse": {
      "id": "uuid",
      "reference": "John 3:16",
      "text": "For God so loved...",
      "translation": "KJV"
    }
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid credentials"
  }
}
```

---

#### **Hour 17-18: External API Integration Plan**
**Tasks:**
- [ ] Research Bible APIs
- [ ] Sign up for API key
- [ ] Test API endpoints
- [ ] Plan caching strategy
- [ ] Design API client wrapper

**Deliverables:**
- `docs/BIBLE_API_INTEGRATION.md` - Integration plan
- API key obtained and tested

**Recommended: API.Bible**
- Free tier: 500 requests/day
- Multiple translations
- Good documentation
- RESTful API

**API Client Design:**
```go
// internal/api/bible_client.go
type BibleClient struct {
    apiKey     string
    baseURL    string
    httpClient *http.Client
}

func (c *BibleClient) GetVerseOfDay() (*Verse, error)
func (c *BibleClient) GetVerse(reference string) (*Verse, error)
func (c *BibleClient) SearchVerses(query string) ([]Verse, error)
```

**Caching Strategy:**
- Cache verses in database after first fetch
- Daily verse cached for 24 hours
- Reduce API calls, improve performance

---

### **DAY 4: Architecture & Code Organization (6 hours)**

#### **Hour 19-20: Backend Architecture**
**Tasks:**
- [ ] Design package structure
- [ ] Plan dependency injection
- [ ] Define interfaces
- [ ] Plan middleware stack

**Deliverables:**
- `docs/BACKEND_ARCHITECTURE.md` - Complete backend design

**Backend Structure:**
```
backend/
├── cmd/
│   └── api/
│       └── main.go              # Entry point
│
├── internal/
│   ├── app/
│   │   ├── app.go               # Application setup
│   │   └── config.go            # Configuration
│   │
│   ├── domain/
│   │   ├── models/              # Data models
│   │   │   ├── user.go
│   │   │   ├── verse.go
│   │   │   └── favorite.go
│   │   │
│   │   ├── repositories/        # Data access interfaces
│   │   │   ├── user_repo.go
│   │   │   ├── verse_repo.go
│   │   │   └── favorite_repo.go
│   │   │
│   │   └── services/            # Business logic
│   │       ├── auth_service.go
│   │       ├── verse_service.go
│   │       └── favorite_service.go
│   │
│   ├── infrastructure/
│   │   ├── database/
│   │   │   ├── postgres.go      # DB connection
│   │   │   └── migrations/      # SQL migrations
│   │   │
│   │   └── bible_api/
│   │       └── client.go        # Bible API client
│   │
│   ├── interfaces/
│   │   └── http/
│   │       ├── handlers/        # HTTP handlers
│   │       │   ├── auth.go
│   │       │   ├── verse.go
│   │       │   └── favorite.go
│   │       │
│   │       ├── middleware/      # Middleware
│   │       │   ├── auth.go
│   │       │   ├── cors.go
│   │       │   └── logger.go
│   │       │
│   │       └── router.go        # Route setup
│   │
│   └── pkg/
│       ├── jwt/                 # JWT utilities
│       ├── validator/           # Input validation
│       └── errors/              # Error handling
│
├── migrations/                  # Database migrations
├── .env.example
├── go.mod
└── Makefile
```

---

#### **Hour 21-22: Frontend Architecture**
**Tasks:**
- [ ] Design component structure
- [ ] Plan state management
- [ ] Define routing
- [ ] Plan API service layer

**Deliverables:**
- `docs/FRONTEND_ARCHITECTURE.md` - Complete frontend design

**Frontend Structure:**
```
frontend/
├── public/
│   ├── index.html
│   └── manifest.json
│
├── src/
│   ├── app/
│   │   ├── App.tsx              # Main app component
│   │   └── routes.tsx           # Route configuration
│   │
│   ├── components/
│   │   ├── common/              # Reusable components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   │
│   │   ├── layout/              # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Sidebar.tsx
│   │   │
│   │   └── verse/               # Verse-specific
│   │       ├── VerseCard.tsx
│   │       ├── VerseList.tsx
│   │       └── VerseDetail.tsx
│   │
│   ├── features/
│   │   ├── auth/                # Authentication feature
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   └── ForgotPassword.tsx
│   │   │
│   │   ├── daily/               # Daily verse feature
│   │   │   └── DailyVerse.tsx
│   │   │
│   │   ├── favorites/           # Favorites feature
│   │   │   ├── FavoritesList.tsx
│   │   │   └── FavoriteItem.tsx
│   │   │
│   │   └── profile/             # Profile feature
│   │       └── Profile.tsx
│   │
│   ├── hooks/                   # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useVerse.ts
│   │   └── useFavorites.ts
│   │
│   ├── services/                # API services
│   │   ├── api.ts               # Base API client
│   │   ├── authService.ts
│   │   ├── verseService.ts
│   │   └── favoriteService.ts
│   │
│   ├── store/                   # State management
│   │   ├── authStore.ts
│   │   ├── verseStore.ts
│   │   └── favoriteStore.ts
│   │
│   ├── types/                   # TypeScript types
│   │   ├── user.ts
│   │   ├── verse.ts
│   │   └── api.ts
│   │
│   ├── utils/                   # Utilities
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── constants.ts
│   │
│   └── styles/                  # Global styles
│       └── globals.css
│
├── .env.example
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

---

#### **Hour 23-24: Development Workflow Setup**
**Tasks:**
- [ ] Plan Git workflow
- [ ] Define commit conventions
- [ ] Create development checklist
- [ ] Plan code review process

**Deliverables:**
- `docs/DEVELOPMENT_WORKFLOW.md` - Development guidelines

**Git Workflow:**
```
main (production)
  ↓
develop (staging)
  ↓
feature/feature-name (development)
```

**Commit Convention:**
```
feat: Add daily verse display
fix: Fix authentication bug
docs: Update API documentation
style: Format code
refactor: Restructure verse service
test: Add unit tests for auth
chore: Update dependencies
```

**Development Checklist:**
- [ ] Write code
- [ ] Write tests
- [ ] Update documentation
- [ ] Test locally
- [ ] Create pull request
- [ ] Code review
- [ ] Merge to develop
- [ ] Test on staging
- [ ] Merge to main
- [ ] Deploy to production

---

### **DAY 5: Implementation Planning (4 hours)**

#### **Hour 25-26: Development Timeline**
**Tasks:**
- [ ] Break down features into tasks
- [ ] Estimate time for each task
- [ ] Create development schedule
- [ ] Identify dependencies

**Deliverables:**
- `docs/DEVELOPMENT_TIMELINE.md` - Week-by-week plan

**Development Timeline (8 weeks part-time):**

**Week 1-2: Backend Foundation**
- Setup Go project
- Database setup & migrations
- Authentication system
- Basic API endpoints

**Week 3-4: Frontend Foundation**
- Setup React project
- Authentication UI
- API integration
- Basic routing

**Week 5-6: Core Features**
- Daily verse display
- Favorites system
- History tracking
- Profile management

**Week 7: Polish & Testing**
- UI improvements
- Bug fixes
- Testing
- Performance optimization

**Week 8: Deployment**
- Setup hosting
- Deploy backend
- Deploy frontend
- Final testing

---

#### **Hour 27-28: Testing Strategy**
**Tasks:**
- [ ] Plan unit tests
- [ ] Plan integration tests
- [ ] Plan E2E tests
- [ ] Define test coverage goals

**Deliverables:**
- `docs/TESTING_STRATEGY.md` - Complete testing plan

**Testing Levels:**

**Unit Tests (80% coverage goal):**
- All business logic functions
- All utility functions
- All API service methods

**Integration Tests:**
- API endpoints
- Database operations
- Authentication flow

**E2E Tests:**
- User signup/login
- View daily verse
- Save to favorites
- View history

**Tools:**
- Backend: Go testing package
- Frontend: Jest + React Testing Library
- E2E: Cypress or Playwright

---

### **DAY 6: Deployment & Documentation (2 hours)**

#### **Hour 29-30: Deployment Planning**
**Tasks:**
- [ ] Choose hosting platforms
- [ ] Plan deployment process
- [ ] Setup CI/CD pipeline
- [ ] Create deployment checklist

**Deliverables:**
- `docs/DEPLOYMENT_GUIDE.md` - Deployment instructions

**Hosting Plan:**

**Backend (Railway - Free Tier):**
- PostgreSQL database
- Go API server
- Environment variables
- Automatic deployments from GitHub

**Frontend (Vercel - Free Tier):**
- React app hosting
- Automatic deployments from GitHub
- Custom domain support
- SSL certificate

**CI/CD Pipeline:**
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  test:
    - Run tests
    - Check code quality
  
  deploy-backend:
    - Build Go app
    - Deploy to Railway
  
  deploy-frontend:
    - Build React app
    - Deploy to Vercel
```

**Deployment Checklist:**
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] API endpoints tested
- [ ] Frontend connected to API
- [ ] SSL certificate active
- [ ] Domain configured
- [ ] Monitoring setup
- [ ] Backup strategy in place

---

## 📦 **What You'll Have After 30 Hours**

### **Complete Documentation Set:**
1. ✅ `PROJECT_VISION.md` - Why you're building this
2. ✅ `TECH_STACK.md` - Technology decisions
3. ✅ `PROJECT_STRUCTURE.md` - Folder organization
4. ✅ `FEATURES.md` - All features prioritized
5. ✅ `USER_STORIES.md` - User journeys
6. ✅ `DESIGN_SYSTEM.md` - UI/UX guidelines
7. ✅ `DATABASE_SCHEMA.md` - Complete schema
8. ✅ `API_ENDPOINTS.md` - API documentation
9. ✅ `BIBLE_API_INTEGRATION.md` - External API plan
10. ✅ `BACKEND_ARCHITECTURE.md` - Backend design
11. ✅ `FRONTEND_ARCHITECTURE.md` - Frontend design
12. ✅ `DEVELOPMENT_WORKFLOW.md` - Git & process
13. ✅ `DEVELOPMENT_TIMELINE.md` - 8-week schedule
14. ✅ `TESTING_STRATEGY.md` - Testing plan
15. ✅ `DEPLOYMENT_GUIDE.md` - Deployment instructions

### **Ready to Start Coding:**
- ✅ Clear vision and goals
- ✅ Technology stack chosen
- ✅ Architecture designed
- ✅ Database schema ready
- ✅ API endpoints defined
- ✅ UI/UX planned
- ✅ Development timeline set
- ✅ Testing strategy in place
- ✅ Deployment plan ready

---

## 🎯 **Next Steps After Planning**

### **Immediate Actions:**
1. **Create GitHub Repository**
   - Initialize with README
   - Add .gitignore
   - Create develop branch

2. **Setup Development Environment**
   - Install Go, Node.js
   - Install PostgreSQL
   - Install VS Code extensions
   - Get Bible API key

3. **Create Project Structure**
   - Create backend folder
   - Create frontend folder
   - Create docs folder
   - Add all planning documents

4. **Start Development**
   - Begin with backend authentication
   - Then database setup
   - Then basic API endpoints
   - Then frontend setup

---

## 💡 **Pro Tips**

### **During Planning:**
- ✅ Take breaks every 2 hours
- ✅ Review BeerInfoApp for inspiration
- ✅ Keep documents simple and clear
- ✅ Focus on MVP, not perfection
- ✅ Ask questions if stuck

### **During Development:**
- ✅ Follow the plan but be flexible
- ✅ Test frequently
- ✅ Commit often
- ✅ Document as you go
- ✅ Deploy early and often

### **Stay Motivated:**
- ✅ Celebrate small wins
- ✅ Share progress with friends
- ✅ Use the app yourself daily
- ✅ Get feedback early
- ✅ Remember why you started

---

## 📊 **Planning Checklist**

Use this to track your progress:

**Day 1: Foundation (6 hours)**
- [ ] Hour 1-2: Project vision defined
- [ ] Hour 3-4: Tech stack chosen
- [ ] Hour 5-6: Project structure designed

**Day 2: Features (6 hours)**
- [ ] Hour 7-8: Features prioritized
- [ ] Hour 9-10: User stories written
- [ ] Hour 11-12: UI/UX designed

**Day 3: Database & API (6 hours)**
- [ ] Hour 13-14: Database schema created
- [ ] Hour 15-16: API endpoints defined
- [ ] Hour 17-18: Bible API integration planned

**Day 4: Architecture (6 hours)**
- [ ] Hour 19-20: Backend architecture designed
- [ ] Hour 21-22: Frontend architecture designed
- [ ] Hour 23-24: Development workflow defined

**Day 5: Implementation (4 hours)**
- [ ] Hour 25-26: Development timeline created
- [ ] Hour 27-28: Testing strategy planned

**Day 6: Deployment (2 hours)**
- [ ] Hour 29-30: Deployment plan ready

---

## 🚀 **You're Ready!**

After completing this 30-hour planning phase, you'll have:
- ✅ Crystal clear vision
- ✅ Solid technical foundation
- ✅ Detailed roadmap
- ✅ Confidence to start coding

**The planning phase is crucial - it will save you 100+ hours during development!**

Good luck with your planning! 🎉

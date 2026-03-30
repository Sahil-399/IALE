# IALE
Intelligent Adaptive Learning Ecosystem
# SnowwEdu - AI-Powered Learning Platform(IALE)

## 🎯 Project Aim

SnowwEdu is an innovative educational platform that leverages artificial intelligence to create personalized learning experiences. The platform generates custom roadmaps and comprehensive courses tailored to individual learning goals, pace, and preferences. Our mission is to make quality education accessible, adaptive, and engaging for every learner.

## ✨ Core Features

### 🗺️ AI-Generated Learning Roadmaps
- **Personalized Planning**: Creates week-by-week learning roadmaps based on user goals
- **Adaptive Content**: Adjusts difficulty and pace according to user progress
- **Topic Coverage**: Supports various subjects and skill levels
- **Visual Progress Tracking**: Interactive timeline with milestone achievements

### 📚 Comprehensive Course Generation
- **Module-Based Structure**: Organized content into logical learning modules
- **Rich Content**: Includes lessons, code examples, exercises, and quizzes
- **Hands-On Learning**: Mini-projects and capstone projects for practical application
- **Resource Integration**: Curated learning resources and references

### 📊 Progress Tracking & Analytics
- **Real-Time Progress**: Track completion of lessons, modules, and courses
- **Visual Dashboards**: Comprehensive overview of learning journey
- **Achievement System**: Celebrate milestones and completed courses
- **Performance Metrics**: Success rates, learning streaks, and activity insights

### 🔐 User Authentication & Management
- **Secure Authentication**: Clerk-based user authentication system
- **Profile Management**: Personal learning profiles and preferences
- **Data Persistence**: Save and access learning progress across sessions
- **Privacy-First**: User data protection and privacy controls

### 🎨 Modern User Interface
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Intuitive Navigation**: Clean, user-friendly interface
- **Interactive Elements**: Engaging animations and micro-interactions
- **Accessibility**: WCAG-compliant design for inclusive learning

## 🏗️ Technical Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js 15 (App Router, React 19)
- **Styling**: Tailwind CSS (globals in `frontend/src/app/globals.css`)
- **Auth**: Clerk (`ClerkProvider` in `frontend/src/app/layout.js`, routes in `src/app/sign-in` & `src/app/sign-up`)
- **Data layer**:
  - **Drizzle ORM** + **Neon Postgres** (`frontend/src/db/*`, `frontend/drizzle.config.ts`)
  - Next.js **route handlers** in `frontend/src/app/api/*`
- **Offline UX**:
  - `public/sw.js` service worker caches shell + key pages
  - `src/lib/offline.js` for cached API responses and offline course storage

### Backend (Python/FastAPI + Groq)
- **Framework**: FastAPI app in `backend/main.py`
- **AI integration**: Groq OpenAI-compatible Chat Completions (`llama-3.x` models)
- **Endpoints**:
  - `POST /generate_course` – full course JSON
  - `POST /generate_roadmap` – week-by-week roadmap JSON

### Database Schema (Drizzle)
- **Users**: managed by Clerk (IDs used in DB)
- **Saved Items**: `saved_items` table stores roadmaps & courses
- **Progress Tracking**: completed lessons/modules + percentage
- **Analytics**: totals & recent activity computed from `saved_items`

## 🚀 Current Implementation Status

### ✅ Completed Features
- [x] User authentication (sign-in/sign-up)
- [x] AI-powered roadmap generation
- [x] Comprehensive course generation
- [x] Progress tracking system
- [x] Dashboard with analytics
- [x] Responsive design
- [x] Data persistence
- [x] Interactive lesson completion
- [x] Mobile optimization

### 🔄 In Progress
- [ ] Advanced analytics dashboard
- [ ] Social learning features
- [ ] Offline mode support
- [ ] Advanced personalization

## 🔮 Future Features

### 🎯 Enhanced Learning Experience
- **Adaptive Learning Paths**: AI-driven course adjustments based on performance
- **Interactive Coding Environment**: In-browser code editor with live execution
- **Video Content Integration**: Multimedia learning materials
- **Voice Assistant**: AI-powered learning companion
- **Gamification**: Points, badges, and leaderboards

### 👥 Social & Collaborative Features
- **Study Groups**: Collaborative learning spaces
- **Peer Review**: Community feedback system
- **Mentorship**: Connect with experienced learners
- **Discussion Forums**: Topic-based community discussions
- **Share Progress**: Social sharing of achievements

### 📈 Advanced Analytics
- **Learning Analytics**: Deep insights into learning patterns
- **Performance Predictions**: AI-powered success forecasting
- **Custom Reports**: Detailed progress reports
- **Comparative Analytics**: Benchmark against peer performance
- **Learning Recommendations**: Personalized content suggestions

### 🔧 Platform Enhancements
- **Mobile Apps**: Native iOS and Android applications
- **Offline Mode**: Download and access content without internet
- **Multi-Language Support**: Internationalization and localization
- **API for Developers**: Third-party integrations
- **Enterprise Features**: Team management and bulk licensing

### 🎓 Educational Features
- **Certification**: Course completion certificates
- **Skill Assessment**: Pre and post-course evaluations
- **Learning Paths**: Curated curriculum sequences
- **Industry Partnerships**: Real-world project opportunities
- **Career Guidance**: AI-powered career recommendations

## 🛠️ Getting Started (short)

### Prerequisites
- Node.js 18+
- Python 3.11+ (your venv uses 3.13)
- PostgreSQL database (e.g. Neon)
- Groq API key
- Clerk dev instance

### 1. Clone & install
```bash
git clone https://github.com/SUYASH2004/SnowwEdu.git
cd SnowwEdu

# Frontend
cd frontend
npm install

# Backend (FastAPI)
cd ../backend
python -m pip install -r requirements.txt  # or: python -m pip install fastapi uvicorn requests python-dotenv
```

### 2. Environment Variables

```env
# backend/.env
GROQ_API_KEY=your_groq_key
GROQ_API_KEY_2=optional_second_key

# frontend/.env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=postgresql://...    # Neon connection string
GROQ_API_KEY=your_groq_key
```

Templates:
- `backend/.env.example`
- `frontend/.env.local.example`

### 3. Drizzle DB setup (frontend)
```bash
cd frontend
npm run db:generate   # optional, regenerates SQL from schema
npm run db:migrate    # applies migrations to DATABASE_URL
```

### 4. Run the stack

**Backend**
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm run dev
```

Open:
- App: http://localhost:3000/
- Backend docs: http://127.0.0.1:8000/docs

## 📁 Project Structure

```text
SnowwEdu/
├── frontend/                      # Next.js frontend application
│   ├── src/
│   │   ├── app/                  # App Router pages and API routes
│   │   │   ├── page.js           # Landing page (SnowwEdu hero)
│   │   │   ├── quiz/             # Course quiz → /result
│   │   │   ├── result/           # Course generation UI
│   │   │   ├── roadmap-quiz/     # Roadmap quiz → /roadmap-result
│   │   │   ├── roadmap-result/   # Roadmap UI
│   │   │   ├── dashboard/        # Personalized dashboard
│   │   │   ├── sign-in/, sign-up/# Clerk auth pages
│   │   │   └── api/              # Route handlers (save/get/update progress, DB tests)
│   │   ├── components/           # Navbar, OfflineStatus, ProgressTracker
│   │   ├── db/                   # Drizzle schema + Neon client
│   │   └── lib/                  # Offline helpers, caching utilities
│   ├── public/                   # Static assets + service worker (sw.js)
│   ├── drizzle/                  # Generated SQL + migration journal
│   └── drizzle.config.ts         # Drizzle CLI config
│
├── backend/                      # FastAPI backend application
│   ├── main.py                   # FastAPI app with /generate_* endpoints
│   └── performance_test.py       # Simple performance test
│
└── README.md                     # Project overview and setup
```

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Contribution Areas
- **Frontend**: UI/UX improvements, new components, responsive design
- **Backend**: API development, database optimization, AI integration
- **Content**: Educational content creation, curriculum design
- **Testing**: Unit tests, integration tests, user testing
- **Documentation**: README updates, API docs, user guides

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Clerk**: Authentication and user management
- **OpenAI**: AI-powered content generation
- **Tailwind CSS**: Utility-first CSS framework
- **Next.js**: React framework for production
- **FastAPI**: Modern Python web framework

## 📞 Contact & Support

- **Email**: support@snowwedu.com
- **GitHub Issues**: [Report bugs and request features](https://github.com/SUYASH2004/SnowwEdu))

---

## 🌟 Vision Statement

At SnowwEdu of IALE, we believe that education should be as unique as each learner. Our AI-powered platform adapts to individual needs, making quality education accessible to everyone, everywhere. We're not just building a learning platform—we're creating a global community of lifelong learners empowered by artificial intelligence.

**Join us in revolutionizing education, one personalized learning journey at a time.** 🚀

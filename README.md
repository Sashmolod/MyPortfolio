# Portfolio Project

Full-stack portfolio application with admin panel built with React + NestJS.

## Tech Stack

**Backend:**
- NestJS + TypeScript
- PostgreSQL + TypeORM
- Passport.js + JWT authentication
- @nestjs/throttler (rate limiting)
- @nestjs/swagger API documentation

**Frontend:**
- React 18 + Vite
- React Router DOM v7
- Framer Motion (animations)
- Axios (HTTP client)

**DevOps:**
- Docker + Docker Compose
- Nginx (frontend serving)

## Features

### Backend
- JWT-based authentication with HttpOnly cookies
- Rate limiting on all endpoints (default: 100/min, short: 3/sec)
- Stricter rate limiting on auth endpoints (5 attempts/min for login)
- Swagger API docs at `/api/docs`
- Health check endpoint at `/health`
- Full CRUD for skills, projects, hero section, contact messages

### Frontend
- Dark/Light theme with localStorage persistence
- Toast notifications (framer-motion animations)
- Inline form validation with error messages
- Loading skeletons (shimmer effect)
- Responsive design
- SEO optimized (meta tags, Open Graph)

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 16+
- Docker & Docker Compose (optional)

### Local Development

```bash
# Backend
cd backend
npm install
cp .env.example .env  # Edit with your config
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Docker Deployment

```bash
# Start all services
docker-compose up -d

# Check health
docker-compose ps
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Admin login (rate limited) |
| POST | `/auth/logout` | Admin logout |
| GET | `/auth/me` | Get current user |
| POST | `/auth/change-password` | Change password (authenticated) |
| GET | `/portfolio/hero` | Get hero data |
| GET | `/portfolio/skills` | Get all skills |
| GET | `/portfolio/projects` | Get all projects |
| GET | `/portfolio/messages` | Get contact messages (auth) |
| POST | `/portfolio/message` | Submit contact form |
| GET | `/health` | Health check |
| GET | `/api/docs` | Swagger documentation |

## Environment Variables

```env
POSTGRES_HOST=db
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=portfolio_db
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## Task Completion Summary

### ✅ Implemented in this session:
1. **Rate Limiting** — `@nestjs/throttler` configured with dual thresholds
   - Default: 100 requests/minute
   - Short: 3 requests/second
   - Login: 5 attempts/minute (stricter)
   - create-first-admin: 3 attempts/5 minutes

2. **Health Check Endpoint** — `/health` for Docker healthchecks
   - Simple: returns service status without DB dependency
   - Detailed: `/health/detail` with memory stats

3. **Toast Notifications** — Replaced all `alert()` calls
   - Animated toasts using framer-motion
   - Types: success, error, warning, info
   - Available globally via `window.toast()`

4. **Inline Form Validation** — Real-time validation with error display
   - ContactForm.jsx — full inline validation
   - AdminDashboard — SkillForm, ProjectForm, password form
   - Visual feedback with red borders on errors

5. **Loading Skeletons** — Shimmer animation while data loads
   - SkeletonCard component in AdminDashboard
   - CSS @keyframes pulse + shimmer animations

6. **SEO Optimization** — Meta tags in index.html
   - Title, description, keywords
   - Open Graph (Facebook) tags
   - Twitter Card tags
   - Theme color

7. **Swagger Documentation** — `@ApiProperty` decorators on all DTOs
   - LoginDto, ChangePasswordDto already have descriptions
   - CreateSkillDto, CreateProjectDto, CreateContactMessageDto complete

### ❌ Remaining tasks (not implemented):
- **Image upload** — Requires multer + storage setup (complex)
- **Unit/E2E tests** — Requires jest + testing libraries setup
- **TypeORM migrations** — Requires generating from entities
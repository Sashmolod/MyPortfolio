# 🔍 Deep Code Audit — Portfolio Project

**Date:** 2026-06-10 | **Stack:** NestJS 10 + React 18 + Vite + PostgreSQL 16 + Docker  
**Commit:** 69a98df | **Working Dir:** /Users/hot_pepper/MyProjectGitHub/MyPortfolio

---

## 1. Executive Summary

### ✅ Strengths
- Well-structured NestJS modular architecture (admin, portfolio, stats, upload, health)
- JWT auth with refresh token rotation + blacklist + account lockout (5 attempts, 15-min lock)
- Soft delete for all CRUD entities + hard delete methods
- TypeORM migrations-based schema management (10 migration files)
- Docker Compose with healthchecks for all services
- CSRF protection middleware on `/api/auth` endpoints
- Visit tracking with comprehensive stats middleware (IP, UA, path, referrer, device, browser, OS)
- AI integration (Gemini) for doodle chat + guessing with graceful fallback
- React code splitting via lazy loading for admin pages
- Error boundary implementation
- Helmet CSP headers configured (production mode)
- Input validation pipes with `whitelist` + `forbidNonWhitelisted`
- Audit log interceptor on upload controller
- JWT_SECRET and JWT_REFRESH_SECRET validated at bootstrap (min 32 chars)

### ⚠️ Issues by Severity
| # | Severity | Issue | File | Line |
|---|----------|-------|------|------|
| 1 | 🔴 HIGH | HMAC captcha uses JWT_SECRET with hardcoded fallback | portfolio.service.ts | 93 |
| 2 | 🔴 HIGH | `Object.assign(hero, dto)` bypasses DTO validation | admin.service.ts | 170 |
| 3 | 🟡 MEDIUM | No rate limiting on auth endpoints | auth.controller.ts | - |
| 4 | 🟡 MEDIUM | `recordVisit()` silently swallows errors | stats.service.ts | 45 |
| 5 | 🟡 MEDIUM | No cleanup cron for uploads or visit stats | docker-compose.yml | 84 |
| 6 | 🟡 MEDIUM | No brute-force protection on changePassword | auth.service.ts | 307 |
| 7 | 🟢 LOW | Gemini API key in URL query params | portfolio.service.ts | 193 |
| 8 | 🟢 LOW | No Content-Security-Policy frame-ancestors strictness | main.ts | 52 |
| 9 | 🟢 LOW | Honeypot field in DTO but no server-side enforcement | create-contact-message.dto.ts | - |
| 10 | 🟢 LOW | No retry logic for failed data fetching in frontend | App.jsx | 149 |

---

## 2. Architecture Overview

```
Docker Network: portfolio-network
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │───▶│    Backend   │───▶│  PostgreSQL  │
│   (Nginx)    │    │   (NestJS)   │    │   (Port 5433)│
│   :80        │    │   :3000      │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

**Backend Modules:**
- `admin/` — Auth, CRUD, Upload, Settings (10 entities: User, Skill, Project, ContactMessage, Hero, SocialLink, Settings, AuditLog, JwtBlacklist, VisitStat)
- `portfolio/` — Public API (skills, projects, hero, contact form, AI features)
- `stats/` — Visit tracking middleware + service
- `health/` — Health check

**Frontend Structure:**
- `src/components/` — Reusable UI components (Header, Hero, Skills, Projects, ContactForm, Footer, Toast, DoodleCanvas, etc.)
- `src/pages/` — Route-level pages (LoginPage)
- `src/admin/pages/` — Admin dashboard pages
- `src/contexts/` — AuthContext, SettingsContext, ThemeContext
- `src/api/` — Typed API modules (authApi, statsApi)

---

## 3. Security Audit

### 3.1 Authentication ✅ Good
- JWT + refresh token mechanism with rotation
- JWT blacklist entity for revocation
- Account lockout (`user.entity.ts`: `lastLoginAttempt`, `failedLoginAttempts`, `lockUntil`)
- Secure cookies: `httpOnly`, `secure`, `sameSite: 'strict'`
- Password hashing with bcrypt (salt rounds: 12)
- CSRF middleware (`csrf.middleware.ts`) on `/api/auth` routes
- Timing attack protection on login (fake bcrypt compare on missing user)
- JWT_SECRET and JWT_REFRESH_SECRET validated at bootstrap (min 32 chars)

### 🔴 ISSUE-1: HMAC Captcha Weakness (HIGH)
**File:** `backend/src/portfolio/portfolio.service.ts:93-98`
```typescript
const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'default-captcha-secret';
const hmac = createHmac('sha256', jwtSecret);
hmac.update(`${expectedAnswer}:${expiresAt}`);
```
**Problem:** 
1. JWT_SECRET leak → captcha forgeable (same secret used for both JWT and captcha HMAC)
2. Hardcoded fallback `'default-captcha-secret'` is trivially guessable
3. Captcha expires in 10 minutes (too long for a simple math question)

**Fix:** 
- Use separate `CAPTCHA_SECRET` env var with NO default fallback
- Reduce expiry to 2-3 minutes
- Add rate limiting per IP for captcha verification

### 🔴 ISSUE-2: Mass Assignment via Object.assign (HIGH)
**File:** `backend/src/admin/admin.service.ts:170`
```typescript
async updateHero(id: number, dto: UpdateHeroDto) {
    const hero = await this.heroRepo.findOne({ where: { id } });
    if (!hero) throw new NotFoundException(`Hero with id ${id} not found`);
    Object.assign(hero, dto);  // ← bypasses DTO validation
    return this.heroRepo.save(hero);
}
```
**Problem:** `Object.assign` copies ALL properties from DTO directly to entity, bypassing TypeORM's column-level validation. If new columns are added to the entity, they could be mass-assigned without controller-level DTO filtering.

**Fix:** Use explicit property mapping:
```typescript
hero.name = dto.name;
hero.title = dto.title;
hero.bio = dto.bio;
hero.avatarUrl = dto.avatarUrl;
hero.resumeUrl = dto.resumeUrl;
hero.ogImageUrl = dto.ogImageUrl;
```

### 🟡 ISSUE-3: No Rate Limiting (MEDIUM)
**File:** `backend/src/admin/auth.controller.ts`
**Problem:** Login/refresh/change-password endpoints have no rate limiting. Brute-force possible if lockout logic is bypassed.

**Fix:** Add `@nestjs/throttler` or custom rate limiter:
```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
// In auth.module.ts
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requests per 60 seconds
```

### 🟡 ISSUE-4: Silent Visit Recording Failures (MEDIUM)
**File:** `backend/src/stats/stats.service.ts:41-48`
```typescript
async recordVisit(visitData: Partial<VisitStat>): Promise<void> {
    try {
      const visit = this.visitStatRepo.create(visitData);
      await this.visitStatRepo.save(visit);
    } catch (error: any) {
      this.logger.error(`Failed to record visit: ${error.message}`, error.stack);
    }
}
```
**Problem:** All errors are silently caught and only logged. Failed visits are invisible to users and middleware. If the DB connection drops, stats silently stop being recorded with no alerting.

**Fix:** 
- Add a retry mechanism or at-least-once delivery pattern
- Add alerting when error rate exceeds threshold
- Consider making `recordVisit` fire-and-forget via a queue (BullMQ)

### 🟡 ISSUE-5: No Cleanup Cron (MEDIUM)
**File:** `docker-compose.yml:84`
**Problem:** 
- Uploads directory is mounted as a volume (`./backend/uploads:/app/uploads`) but no cleanup mechanism
- Visit stats are never cleaned up (only `cleanupOldVisits()` method exists but is never called)
- Audit logs grow unbounded

### 🟡 ISSUE-6: No Brute-Force Protection on changePassword (MEDIUM)
**File:** `backend/src/admin/auth.service.ts:307`
**Problem:** `changePassword()` endpoint has no rate limiting. An attacker with access to a user's session could spam password change attempts.
**Fix:** Add rate limiting and require current password verification (already done) + add cooldown between attempts.

---

## 4. Database & Migrations

### Schema (10 entities, 10 migrations)
| Entity | File | Key Fields |
|--------|------|------------|
| User | `user.entity.ts` | username, passwordHash, role, failedLoginAttempts, lockUntil |
| Skill | `skill.entity.ts` | name, icon, description, sortOrder, deletedAt |
| Project | `project.entity.ts` | title, description, techStack, imageUrl, githubUrl, liveUrl, sortOrder, viewCount |
| ContactMessage | `contact-message.entity.ts` | name, email, message, replied, deletedAt |
| Hero | `hero.entity.ts` | name, title, bio, avatarUrl, resumeUrl, ogImageUrl |
| SocialLink | `social-link.entity.ts` | name, url, icon, sortOrder |
| Settings | `settings.entity.ts` | enableDoodly, enableBug, enablePageTear, enableInkLeak, enableEasterEgg, showAdminLink |
| AuditLog | `audit-log.entity.ts` | userId, action, entityType, entityId, ipAddress, userAgent, timestamp |
| JwtBlacklist | `jwt-blacklist.entity.ts` | tokenIdentifier, expiresAt |
| VisitStat | `visit-stat.entity.ts` | ipAddress, userAgent, path, referrer, country, browser, os, deviceType, visitedAt |

### Migration Status
- ✅ 10 migration files in `backend/src/migrations/`
- ✅ `data-source.ts` configured for TypeORM migrations
- ✅ Migration commands: `migration:generate`, `migration:run`
- ⚠️ No `synchronize: true` in production (good)

### Index Optimization
- `1781098401948-AddDatabaseIndices.ts` adds indexes for performance
- Covers: `VisitStat.visitedAt`, `Project.viewCount`, `ContactMessage.deletedAt`

---

## 5. Frontend Security

### ✅ Good Practices
- Axios instance for API calls (`frontend/src/api.js`)
- ProtectedRoute component for auth guards
- Error boundaries for crash recovery
- Helmet for SEO meta tags
- No raw `fetch` in components (uses api instance)

### 🟢 ISSUE-7: Gemini API Key in URL Query Params (LOW)
**File:** `backend/src/portfolio/portfolio.service.ts:193`
**Problem:** API key passed as URL query parameter (`?key=...`) which gets logged in server access logs and browser network tab.
**Fix:** Pass API key in request headers instead of query params.

### 🟢 ISSUE-8: Honeypot Field Without Server Enforcement (LOW)
**File:** `create-contact-message.dto.ts`
**Problem:** Honeypot field (`websiteUrl`) exists in DTO but no server-side validation to reject submissions where it is filled.
**Fix:** Add validation: `@IsEmpty({ message: 'Bot detected' })` on `websiteUrl`.

### 🟢 ISSUE-9: No Retry Logic for Data Fetching (LOW)
**File:** `frontend/src/App.jsx:149-166`
**Problem:** If initial data fetch fails, the page shows "Loading..." forever with no retry.
**Fix:** Add retry logic or error state with retry button.

---

## 6. Docker & Infrastructure

### ✅ Good Practices
- Healthchecks for all services
- Named volumes for PostgreSQL data
- JSON file logging with size limits
- Bridge network isolation
- `depends_on` with health conditions
- `.env` files excluded via `.dockerignore`

### ⚠️ Recommendations
1. Add `--no-cache` to Docker builds for security
2. Use Docker secrets for sensitive values in production
3. Add `deploy.resources.limits` for resource constraints
4. Pin Docker image versions (e.g., `postgres:16.4-alpine` instead of `postgres:16-alpine`)

---

## 7. AI Integration

### ✅ Good Practices
- Graceful fallback on Gemini API failure
- Image preprocessing (canvas capture, base64 encoding)
- Session-based tracking (sessionStorage)

### ⚠️ Recommendations
1. Add request size limits for doodle images
2. Cache common doodle responses to reduce API costs
3. Add timeout for Gemini API calls

---

## 8. Testing

### Current State
- ✅ E2E tests: `backend/test/` (admin, auth, portfolio)
- ✅ Unit test config: `backend/jest.config.js`
- ✅ Component tests: `frontend/src/setupTests.js`
- ✅ Spec files for components (`.spec.tsx/.spec.jsx`)

### ⚠️ Recommendations
1. Add integration tests for auth flow (login → protected route → logout)
2. Add captcha verification tests
3. Add CSRF validation tests
4. Add coverage threshold in Jest config

---

## 9. Environment Variables

### Required (.env.example)
```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=portfolio_db
JWT_SECRET=<32+ chars>
JWT_REFRESH_SECRET=<32+ chars>
JWT_EXPIRES_IN=7d
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<strong-password>
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
GEMINI_API_KEY=<key>
PORT=3001
NODE_ENV=development
```

### ⚠️ Recommendations
1. Add `CAPTCHA_SECRET` env var (separate from JWT_SECRET)
2. Add `UPLOAD_DIR` env var for uploads path
3. Add `RATE_LIMIT_MAX` and `RATE_LIMIT_WINDOW` for configurable rate limiting

---

## 10. Recommendations Summary

### 🔴 Critical (Fix Immediately)
1. **Separate CAPTCHA_SECRET** from JWT_SECRET
2. **Replace Object.assign** with explicit property mapping in `updateHero`

### 🟡 Medium (Next Sprint)
3. Add `@nestjs/throttler` for rate limiting
4. Add cleanup cron for uploads/stats/audit logs
5. Add alerting for silent failures in `recordVisit`
6. Add brute-force protection on `changePassword`

### 🟢 Low (Backlog)
7. Pass Gemini API key in headers, not query params
8. Add server-side honeypot validation
9. Add retry logic for frontend data fetching
10. Add integration and CSRF tests

---

## 11. Compliance Checklist

| Check | Status |
|-------|--------|
| No hardcoded secrets | ✅ (except captcha fallback - see ISSUE-1) |
| JWT_SECRET >= 32 chars | ✅ (validated at bootstrap) |
| HTTPS in production | ⚠️ (depends on reverse proxy/Nginx) |
| CSRF protection | ✅ (on `/api/auth`) |
| CORS restricted | ✅ (origin whitelist) |
| Input validation | ✅ (ValidationPipe with whitelist) |
| SQL injection protection | ✅ (TypeORM query builder) |
| XSS protection | ✅ (Helmet CSP, React escaping) |
| Password hashing | ✅ (bcrypt, salt rounds: 12) |
| Account lockout | ✅ (5 attempts, 15-min lock) |
| Secure cookies | ✅ (httpOnly, secure, sameSite) |
| Soft delete | ✅ (all CRUD entities) |
| Audit logging | ✅ (upload operations) |
| Migration-based schema | ✅ (10 migrations) |

---

**Audit completed by:** Cline AI  
**Next review:** After fixing all 🔴 issues

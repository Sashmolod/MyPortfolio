# 🔍 Code Audit Report — MyPortfolio

**Date:** 05.06.2026 (Updated)
**Stack:** NestJS 10 (TypeScript) + React 18 + Vite + PostgreSQL 16
**Structure:** `backend/` (NestJS) / `frontend/` (React SPA)
**Commit:** 6f4805e0f1b3c35bd758bb85ceef1674b968468d

---

## 📊 Executive Summary

| Category | Score | Status |
|----------|-------|--------|
| Architecture | ✅ Good | Feature-based modules, clear separation |
| Security | ⚠️ Warning | Default admin credentials, weak JWT secret |
| Infrastructure | ✅ Good | Well-configured Docker, healthchecks |
| Code Quality | ✅ Good | TypeScript strict, async/await, functional components |
| Testing | ❌ Critical | Minimal test coverage |
| Documentation | ✅ Good | Comprehensive README |

---

## 🔴 CRITICAL Issues

### 1. [SECURITY] Weak JWT Secret in Production
**File:** `backend/.env.prod`, `docker-compose.yml`
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
```
**Problem:** Демонстрационный/шаблонный секрет. В production это критическая уязвимость.
**Severity:** 🔴 HIGH
**Recommendation:** Сгенерировать криптографически стойкий секрет:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. [SECURITY] Default Admin Credentials
**File:** `docker-compose.yml` (строка 75)
```yaml
ADMIN_PASSWORD: ${ADMIN_PASSWORD:-admin}
```
**Problem:** По умолчанию пароль = `admin`. README указывает `admin123`.
**Severity:** 🔴 HIGH
**Recommendation:** Сделать обязательным требованием для production. При пустом значении — блокировать запуск.

### 3. [SECURITY] ADMIN_PASSWORD пустой = генерация случайного
**File:** `docker-compose.yml` (комментарий строка 73)
```
# ⚠️ В production ОБЯЗАТЕЛЬНО установите ADMIN_PASSWORD через .env файл!
```
**Problem:** Комментарий предупреждает, но нет принудительной валидации.
**Severity:** 🔴 MEDIUM
**Recommendation:** Добавить валидацию в `docker-entrypoint.sh` или `seed.ts`.

---

## 🟡 MEDIUM Issues

### 4. [INFRASTRUCTURE] Port inconsistency (DEV vs PROD)
**Files:** 
- `backend/.env.dev`: `PORT=3001`
- `docker-compose.yml`: `PORT=3000`
- `docker-compose.dev.yml`: `BACKEND_PORT=3001`

**Problem:** Разные порты между окружениями создают путаницу.
**Severity:** 🟡 MEDIUM
**Recommendation:** Документировать или унифицировать.

### 5. [DATABASE] Empty migrations directory
**File:** `backend/src/migrations/` (пустая директория)
**Problem:** Нет версионированных миграций. `synchronize: false` в app.module.ts.
**Severity:** 🟡 MEDIUM
**Recommendation:** Создать миграции:
```bash
cd backend && npm run migration:generate -- src/migrations/InitialSchema
npm run migration:run
```

### 6. [SECURITY] JWT_EXPIRES_IN = 7 дней
**File:** `docker-compose.yml` (строка 69)
```yaml
JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-7d}
```
**Problem:** 7 дней — слишком долго для JWT. При компрометации токена окно доступа велико.
**Severity:** 🟡 MEDIUM
**Recommendation:** Использовать `1h` + refresh tokens.

### 7. [SECURITY] DATABASE_URL в docker-compose с паролем в URL
**File:** `docker-compose.yml` (строка 67)
```yaml
DATABASE_URL: postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-postgres}@db:5432/${POSTGRES_DB:-portfolio_db}
```
**Problem:** Пароль попадает в URL, что может быть залогировано.
**Severity:** 🟡 LOW
**Recommendation:** Использовать отдельные переменные (уже есть POSTGRES_HOST, POSTGRES_USER и т.д.).

### 8. [FRONTEND] No TypeScript
**File:** `frontend/` — все файлы `.jsx`, `.js`
**Problem:** Нет type safety на frontend.
**Severity:** 🟡 LOW
**Recommendation:** Рассмотреть миграцию на TypeScript при следующем рефакторинге.

### 9. [FRONTEND] Hero image hardcoded
**File:** `frontend/src/assets/hero.png`
**Problem:** Нет возможности менять hero-изображение через админку без деплоя кода.
**Severity:** 🟡 LOW
**Recommendation:** Добавить upload endpoint для hero-изображения.

---

## 🟢 LOW / INFO

### 10. [SECURITY] CORS — permissive origins
**File:** `docker-compose.yml` (строка 70)
```yaml
ALLOWED_ORIGINS: ${ALLOWED_ORIGINS:-http://localhost:5173,http://localhost:3000,http://frontend:80,http://localhost,http://127.0.0.1}
```
**Status:** ✅ Принято — конкретные origins, не `*`.

### 11. [SECURITY] Rate Limiting
**File:** `backend/src/app.module.ts` (строки 18-31)
**Status:** ✅ Реализован через `@nestjs/throttler` с short (10/сек) и default (60/мин) правилами.

### 12. [ARCHITECTURE] admin.module.ts exports TypeOrmModule globally
**File:** `backend/src/admin/admin.module.ts` (строка 23)
```typescript
exports: [AdminService, TypeOrmModule],
```
**Problem:** `@Global()` + экспорт TypeOrmModule может привести к circular dependencies.
**Severity:** 🟢 LOW
**Recommendation:** Рассмотреть удаление `@Global()` если не требуется.

### 13. [FRONTEND] Toast через window.toast
**File:** `frontend/src/components/ContactForm.jsx`
**Problem:** Зависимость от глобального callback.
**Severity:** 🟢 LOW
**Recommendation:** Создать ToastContext.

### 14. [FRONTEND] HashRouter → BrowserRouter ✅
**Status:** ✅ Исправлено в `frontend/src/main.jsx`.

### 15. [FRONTEND] Header admin link ✅
**Status:** ✅ Исправлено — используется `<Link to="/admin">`.

---

## 🧪 Testing Analysis

### Backend Tests
| File | Type | Coverage |
|------|------|----------|
| `backend/src/admin/upload/upload.controller.spec.ts` | Unit | ✅ |
| `backend/test/app.e2e-spec.ts` | E2E | ✅ |
| `backend/jest.config.js` | Config | ✅ |
| `backend/test/jest-e2e.config.js` | E2E Config | ✅ |

**Problem:** Только 1 unit test (upload) + 1 e2e spec (базовый). Нет тестов для:
- Auth service/controller
- Admin service
- Portfolio service
- DTO validation

### Frontend Tests
| Status | Нет тестов |
|--------|------------|

**Recommendation:** Добавить Vitest + React Testing Library.

---

## 📁 File Structure Analysis

### Backend (`backend/src/`)
```
admin/
├── admin.controller.ts    ✅ RESTful endpoints
├── admin.module.ts        ✅ @Global() + feature imports
├── admin.service.ts       ✅ Business logic
├── auth.controller.ts     ✅ JWT auth
├── auth.module.ts         ✅ JwtModule.registerAsync
├── auth.service.ts        ✅ Auth logic
├── jwt.strategy.ts        ✅ Passport JWT
├── user.service.ts        ✅ User CRUD
├── dto/                   ✅ DTOs with validation
├── entities/              ✅ TypeORM entities
└── upload/                ✅ File upload
portfolio/
├── portfolio.controller.ts ✅ Public API
├── portfolio.module.ts    ✅
└── portfolio.service.ts   ✅
migration/
├── run.ts                 ✅
└── migrations/            ❌ Пусто
health.module.ts           ✅ Health check
main.ts                    ✅ NestJS bootstrap
app.module.ts              ✅ Root module
data-source.ts             ✅ TypeORM config
seed.ts                    ✅ DB seeding
```

### Frontend (`frontend/src/`)
```
admin/pages/
└── AdminDashboard.jsx     ✅ Admin panel
components/
├── ContactForm.jsx        ✅
├── Footer.jsx             ✅
├── Header.jsx             ✅
├── Hero.jsx               ✅
├── Projects.jsx           ✅
├── ProtectedRoute.tsx     ✅ Auth guard
├── Skills.jsx             ✅
├── SvgIllustrations.jsx   ✅
└── Toast.jsx              ✅
contexts/
└── AuthContext.tsx        ✅ Auth state management
pages/
└── LoginPage.tsx          ✅ Login page
api/
└── authApi.ts             ✅ Auth API functions
```

---

## 🔐 Security Deep Dive

### JWT Authentication
| Aspect | Status | Notes |
|--------|--------|-------|
| Strategy | ✅ | Passport JWT (stateless) |
| Blacklist | ✅ | JwtBlacklistEntity для logout |
| Cookie HttpOnly | ✅ | Secure cookie setup |
| Cookie SameSite | ✅ | `Lax` protection |
| Secret Strength | ❌ | Weak default secret |
| Token Expiry | ⚠️ | 7 days is too long |
| Refresh Tokens | ❌ | Нет реализации |

### File Upload Security
| Aspect | Status | Notes |
|--------|--------|-------|
| Extension Whitelist | ✅ | image/jpeg, image/png, image/webp |
| File Size Limit | ✅ | 5MB max |
| Storage Location | ✅ | Outside Docker volume |
| Access Control | ✅ | `/public/uploads/` через Nginx |

### Database Security
| Aspect | Status | Notes |
|--------|--------|-------|
| Connection Pool | ✅ | TypeORM config |
| SSL (production) | ❌ | Нет SSL/TLS для DB connection |
| Migrations | ❌ | Пустая директория |
| Backup Strategy | ❌ | Нет backup в docker-compose |

---

## 🏗️ Architecture Review

### Backend Module Dependencies
```
app.module.ts
├── AdminModule (@Global())
│   ├── AuthModule
│   │   ├── JwtModule
│   │   └── PassportModule
│   ├── UploadModule
│   └── TypeOrmModule (global)
├── PortfolioModule
│   └── TypeOrmModule (re-import)
├── HealthModule
└── ThrottlerModule
```

**Observations:**
- ✅ `@Global()` на AdminModule уместен — нужен общий доступ к TypeORM
- ✅ Throttler настроен с разными лимитами для short/default
- ⚠️ PortfolioModule импортирует TypeOrmModule повторно — работает, но избыточно

### Frontend Component Hierarchy
```
App.jsx
├── BrowserRouter
│   ├── Routes
│   │   ├── LoginPage (public)
│   │   ├── AdminDashboard (protected)
│   │   └── Home (public)
│   │       ├── Header
│   │       │   ├── Hero
│   │       │   ├── Projects
│   │       │   ├── Skills
│   │       │   ├── ContactForm
│   │       │   └── Footer
│   │       └── ThemeContext
│   └── AuthContext
```

**Observations:**
- ✅ Clear separation: public pages + protected admin
- ✅ Context pattern для auth и theme
- ⚠️ Нет lazy loading для routes (большой initial bundle)

---

## 📋 Recommendations Priority Matrix

### 🔴 Immediate Action Required
| # | Issue | Effort | Impact |
|---|-------|--------|--------|
| 1 | Сменить JWT_SECRET на production | 5 мин | 🔴 HIGH |
| 2 | Запретить ADMIN_PASSWORD=admin | 15 мин | 🔴 HIGH |
| 3 | Добавить миграции БД | 30 мин | 🟡 MEDIUM |

### 🟡 Short-term (1-2 недели)
| # | Issue | Effort | Impact |
|---|-------|--------|--------|
| 4 | Уменьшить JWT_EXPIRES_IN до 1h | 5 мин | 🟡 MEDIUM |
| 5 | Добавить refresh tokens | 2 часа | 🟡 MEDIUM |
| 6 | Унифицировать порты DEV/PROD | 15 мин | 🟡 LOW |
| 7 | Добавить SSL для DB connection | 30 мин | 🟡 MEDIUM |

### 🟢 Long-term (1-2 месяца)
| # | Issue | Effort | Impact |
|---|-------|--------|--------|
| 8 | Добавить backend unit tests | 8 часов | 🟡 MEDIUM |
| 9 | Добавить frontend tests | 8 часов | 🟡 MEDIUM |
| 10 | Миграция frontend на TypeScript | 1 день | 🟢 LOW |
| 11 | Добавить lazy loading routes | 1 час | 🟢 LOW |
| 12 | Добавить DB backup strategy | 2 часа | 🟡 MEDIUM |

---

## 📊 Code Metrics

### Backend
| Metric | Value |
|--------|-------|
| TypeScript files | ~25 |
| DTOs | 10 |
| Entities | 6 |
| Modules | 5 |
| Guards/Interceptors | 2 |
| Test files | 2 |

### Frontend
| Metric | Value |
|--------|-------|
| JS/JSX files | ~15 |
| TSX files | 2 |
| Components | 9 |
| Pages | 3 |
| Contexts | 2 |
| Tests | 0 |

---

## ✅ Positive Findings

1. **Rate Limiting** — `@nestjs/throttler` настроен с разными лимитами
2. **JWT Blacklist** — реализован для logout
3. **File Upload Validation** — whitelist extensions + size limit
4. **Docker Healthchecks** — все сервисы имеют healthcheck
5. **TypeORM Configuration** — `ConfigService` для dependency injection
6. **Protected Routes** — корректная реализация на frontend
7. **Axios Interceptor** — обработка 401 ошибок
8. **Feature-based Modules** — чистая архитектура NestJS
9. **Docker Logging** — json-file driver с rotation
10. **Database Healthcheck** — `pg_isready` проверка

---

## 📝 Notes

- `.dbclient/` — внешнее расширение VS Code, не часть проекта
- `TODO.md` — содержит список задач для проекта
- `.clinerules` — инструкции для Cline, дублируют часть этого аудита
- `dist/` и `node_modules/` — игнорируются через `.gitignore`
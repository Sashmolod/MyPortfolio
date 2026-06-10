# 🔍 Глубокий аудит кода — Portfolio Project

**Дата:** 2026-06-10 | **Стек:** NestJS 10 + React 18 + Vite + PostgreSQL 16 + Docker  
**Коммит:** 69a98df | **Рабочая директория:** /Users/hot_pepper/MyProjectGitHub/MyPortfolio

---

## 1. Итоговое резюме

### ✅ Сильные стороны
- Хорошо структурированная модульная архитектура NestJS (admin, portfolio, stats, upload, health)
- JWT аутентификация с ротацией refresh-токенов + blacklist + блокировка аккаунта (5 попыток, 15 мин блокировка)
- Soft delete для всех CRUD-сущностей + методы hard delete
- TypeORM миграции для управления схемой (10 файлов миграций)
- Docker Compose с healthcheck для всех сервисов
- CSRF защита middleware на `/api/auth` эндпоинтах
- Отслеживание визитов с comprehensive stats middleware (IP, UA, path, referrer, device, browser, OS)
- AI интеграция (Gemini) для doodle chat + guessing с graceful fallback
- Code splitting React через lazy loading для admin-страниц
- Error boundary реализация
- Helmet CSP заголовки настроены (production mode)
- Pipes валидации входных данных с `whitelist` + `forbidNonWhitelisted`
- Audit log interceptor на upload controller
- JWT_SECRET и JWT_REFRESH_SECRET валидируются при запуске (мин. 32 символа)

### ⚠️ Проблемы по степени серьёзности
| # | Степень | Проблема | Файл | Строка |
|---|----------|-------|------|------|
| 1 | 🔴 HIGH | HMAC captcha использует JWT_SECRET с hardcoded fallback | portfolio.service.ts | 93 |
| 2 | 🔴 HIGH | `Object.assign(hero, dto)` обходит DTO валидацию | admin.service.ts | 170 |
| 3 | 🟡 MEDIUM | Нет rate limiting на auth эндпоинтах | auth.controller.ts | - |
| 4 | 🟡 MEDIUM | `recordVisit()` молча проглатывает ошибки | stats.service.ts | 45 |
| 5 | 🟡 MEDIUM | Нет cleanup cron для uploads или visit stats | docker-compose.yml | 84 |
| 6 | 🟡 MEDIUM | Нет brute-force защиты на changePassword | auth.service.ts | 307 |
| 7 | 🟢 LOW | Gemini API key в URL query params | portfolio.service.ts | 193 |
| 8 | 🟢 LOW | Нет Content-Security-Policy frame-ancestors strictness | main.ts | 52 |
| 9 | 🟢 LOW | Honeypot поле в DTO, но нет server-side enforcement | create-contact-message.dto.ts | - |
| 10 | 🟢 LOW | Нет retry логики для failed data fetching во frontend | App.jsx | 149 |

---

## 2. Обзор архитектуры

```
Docker Network: portfolio-network
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │───▶│    Backend   │───▶│  PostgreSQL  │
│   (Nginx)    │    │   (NestJS)   │    │   (Port 5433)│
│   :80        │    │   :3000      │    │              │
└──────────────┘    └──────────────┘    └──────────────┘
```

**Backend Модули:**
- `admin/` — Auth, CRUD, Upload, Settings (10 сущностей: User, Skill, Project, ContactMessage, Hero, SocialLink, Settings, AuditLog, JwtBlacklist, VisitStat)
- `portfolio/` — Public API (skills, projects, hero, contact form, AI features)
- `stats/` — Visit tracking middleware + service
- `health/` — Health check

**Frontend Структура:**
- `src/components/` — Переиспользуемые UI компоненты (Header, Hero, Skills, Projects, ContactForm, Footer, Toast, DoodleCanvas, и т.д.)
- `src/pages/` — Страницы на уровне роутов (LoginPage)
- `src/admin/pages/` — Admin dashboard страницы
- `src/contexts/` — AuthContext, SettingsContext, ThemeContext
- `src/api/` — Типизированные API модули (authApi, statsApi)

---

## 3. Аудит безопасности

### 3.1 Аутентификация ✅ Хорошо
- JWT + refresh token механизм с ротацией
- JWT blacklist entity для отзыва
- Блокировка аккаунта (`user.entity.ts`: `lastLoginAttempt`, `failedLoginAttempts`, `lockUntil`)
- Secure cookies: `httpOnly`, `secure`, `sameSite: 'strict'`
- Хэширование паролей bcrypt (salt rounds: 12)
- CSRF middleware (`csrf.middleware.ts`) на `/api/auth` роутах
- Защита от timing attack на login (fake bcrypt compare при отсутствии пользователя)
- JWT_SECRET и JWT_REFRESH_SECRET валидируются при запуске (мин. 32 символа)

### 🔴 ISSUE-1: Слабость HMAC Captcha (HIGH)
**Файл:** `backend/src/portfolio/portfolio.service.ts:93-98`
```typescript
const jwtSecret = this.configService.get<string>('JWT_SECRET') || 'default-captcha-secret';
const hmac = createHmac('sha256', jwtSecret);
hmac.update(`${expectedAnswer}:${expiresAt}`);
```
**Проблема:** 
1. Утечка JWT_SECRET → captcha можно подделать (тот же секрет для JWT и captcha HMAC)
2. Hardcoded fallback `'default-captcha-secret'` тривиально угадывается
3. Captcha истекает через 10 минут (слишком долго для простого математического вопроса)

**Исправление:** 
- Использовать отдельную переменную окружения `CAPTCHA_SECRET` без fallback
- Уменьшить время истечения до 2-3 минут
- Добавить rate limiting по IP для верификации captcha

### 🔴 ISSUE-2: Mass Assignment через Object.assign (HIGH)
**Файл:** `backend/src/admin/admin.service.ts:170`
```typescript
async updateHero(id: number, dto: UpdateHeroDto) {
    const hero = await this.heroRepo.findOne({ where: { id } });
    if (!hero) throw new NotFoundException(`Hero with id ${id} not found`);
    Object.assign(hero, dto);  // ← обходит DTO валидацию
    return this.heroRepo.save(hero);
}
```
**Проблема:** `Object.assign` копирует ВСЕ свойства из DTO напрямую в entity, обходя column-level валидацию TypeORM. Если в entity будут добавлены новые колонки, они могут быть mass-assigned без фильтрации на уровне controller DTO.

**Исправление:** Использовать явное маппинг свойств:
```typescript
hero.name = dto.name;
hero.title = dto.title;
hero.bio = dto.bio;
hero.avatarUrl = dto.avatarUrl;
hero.resumeUrl = dto.resumeUrl;
hero.ogImageUrl = dto.ogImageUrl;
```

### 🟡 ISSUE-3: Нет Rate Limiting (MEDIUM)
**Файл:** `backend/src/admin/auth.controller.ts`
**Проблема:** Login/refresh/change-password эндпоинты не имеют rate limiting. Brute-force возможен, если логика lockout будет обойдена.

**Исправление:** Добавить `@nestjs/throttler` или собственный rate limiter:
```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
// В auth.module.ts
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 запросов за 60 секунд
```

### 🟡 ISSUE-4: Молчаливые ошибки записи визитов (MEDIUM)
**Файл:** `backend/src/stats/stats.service.ts:41-48`
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
**Проблема:** Все ошибки молча перехватываются и только логируются. Неудачные визиты невидимы для пользователей, а middleware перетирает данные. Если DB-соединение упадёт, статистика будет молча теряться.

**Исправление:**
- Добавить retry-механизм или pattern at-least-once delivery
- Добавить алертинг при превышении error rate
- Рассмотреть использование очереди (BullMQ) для fire-and-forget записи

---

## 4. База данных и миграции

### Схема (10 сущностей, 10 миграций)
| Сущность | Файл | Ключевые поля |
|----------|------|---------------|
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

### Статус миграций
- ✅ 10 файлов миграций в `backend/src/migrations/`
- ✅ `data-source.ts` настроен для TypeORM миграций
- ✅ Команды миграций: `migration:generate`, `migration:run`
- ⚠️ `synchronize: true` отключён в production (хорошо)

### Оптимизация индексов
- `1781098401948-AddDatabaseIndices.ts` добавляет индексы для производительности
- Покрытие: `VisitStat.visitedAt`, `Project.viewCount`, `ContactMessage.deletedAt`

---

## 5. Безопасность Frontend

### ✅ Хорошие практики
- Axios instance для API вызовов (`frontend/src/api.js`)
- ProtectedRoute компонент для auth guards
- Error boundaries для crash recovery
- Helmet для SEO meta tags
- Нет raw `fetch` в компонентах (используется api instance)

### 🟢 ISSUE-7: Gemini API Key в URL query params (LOW)
**Файл:** `backend/src/portfolio/portfolio.service.ts:193`
**Проблема:** API ключ передаётся как query parameter (`?key=...`), что попадает в логи сервера и network tab браузера.
**Исправление:** Передавать API ключ в headers запроса вместо query params.

### 🟢 ISSUE-8: Honeypot поле без server-side валидации (LOW)
**Файл:** `create-contact-message.dto.ts`
**Проблема:** Honeypot поле (`websiteUrl`) существует в DTO, но нет server-side валидации для отклонения заполненных подмиток.
**Исправление:** Добавить валидацию: `@IsEmpty({ message: 'Bot detected' })` на `websiteUrl`.

### 🟢 ISSUE-9: Нет retry логики для загрузки данных (LOW)
**Файл:** `frontend/src/App.jsx:149-166`
**Проблема:** Если начальный запрос данных падает, страница показывает "Loading..." навсегда без возможности retry.
**Исправление:** Добавить retry логику или error state с кнопкой retry.

---

## 6. Docker и инфраструктура

### ✅ Хорошие практики
- Healthchecks для всех сервисов
- Named volumes для данных PostgreSQL
- JSON file logging с лимитами размера
- Bridge network isolation
- `depends_on` с health conditions
- `.env` файлы исключены через `.dockerignore`

### ⚠️ Рекомендации
1. Добавить `--no-cache` к Docker build для безопасности
2. Использовать Docker secrets для чувствительных значений в production
3. Добавить `deploy.resources.limits` для resource constraints
4. Пинить версии Docker образов (например, `postgres:16.4-alpine` вместо `postgres:16-alpine`)

---

## 7. AI интеграция

### ✅ Хорошие практики
- Graceful fallback при отказе Gemini API
- Preprocessing изображений (canvas capture, base64 encoding)
- Session-based tracking (sessionStorage)

### ⚠️ Рекомендации
1. Добавить лимиты размера для doodle изображений
2. Кэшировать частые ответы Gemini для снижения API cost
3. Добавить timeout для Gemini API вызовов

---

## 8. Тестирование

### Текущее состояние
- ✅ E2E тесты: `backend/test/` (admin, auth, portfolio)
- ✅ Unit test config: `backend/jest.config.js`
- ✅ Component tests: `frontend/src/setupTests.js`
- ✅ Spec файлы для компонентов (`.spec.tsx/.spec.jsx`)

### ⚠️ Рекомендации
1. Добавить integration тесты для auth flow (login → protected route → logout)
2. Добавить тесты для captcha verification
3. Добавить CSRF валидационные тесты
4. Добавить threshold coverage в Jest config

---

## 9. Переменные окружения

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

### ⚠️ Рекомендации
1. Добавить `CAPTCHA_SECRET` env var (отдельно от JWT_SECRET)
2. Добавить `UPLOAD_DIR` env var для пути uploads
3. Добавить `RATE_LIMIT_MAX` и `RATE_LIMIT_WINDOW` для конфигурируемого rate limiting

---

## 10. Сводка рекомендаций

### 🔴 Критические (Исправить немедленно)
1. **Разделить CAPTCHA_SECRET** от JWT_SECRET
2. **Заменить Object.assign** на явное маппинг свойств в `updateHero`

### 🟡 Средние (Следующий спринт)
3. Добавить `@nestjs/throttler` для rate limiting
4. Добавить cleanup cron для uploads/stats/audit logs
5. Добавить алертинг для silent failures в `recordVisit`
6. Добавить brute-force защиту на `changePassword`

### 🟢 Низкие (Backlog)
7. Передавать Gemini API key в headers, не query params
8. Добавить server-side honeypot валидацию
9. Добавить retry логику для frontend data fetching
10. Добавить integration и CSRF тесты

---

## 11. Compliance Checklist

| Проверка | Статус |
|----------|--------|
| Нет hardcoded secrets | ✅ (кроме captcha fallback - см. ISSUE-1) |
| JWT_SECRET >= 32 символов | ✅ (валидируется при запуске) |
| HTTPS в production | ⚠️ (зависит от reverse proxy/Nginx) |
| CSRF защита | ✅ (на `/api/auth`) |
| CORS ограничен | ✅ (whitelist origin) |
| Валидация входных данных | ✅ (ValidationPipe с whitelist) |
| Защита от SQL injection | ✅ (TypeORM query builder) |
| XSS защита | ✅ (Helmet CSP, React escaping) |
| Хэширование паролей | ✅ (bcrypt, salt rounds: 12) |
| Блокировка аккаунта | ✅ (5 попыток, 15 мин блокировка) |
| Secure cookies | ✅ (httpOnly, secure, sameSite) |
| Soft delete | ✅ (все CRUD сущности) |
| Audit logging | ✅ (upload операции) |
| Migration-based schema | ✅ (10 миграций) |

---

**Аудит выполнен:** Cline AI
**Следующая проверка:** После исправления всех 🔴 проблем

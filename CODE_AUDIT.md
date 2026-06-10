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
**Проблема:** Все ошибки молча перехватываются и только логируются. Неудачные визиты невидимы для пользователей
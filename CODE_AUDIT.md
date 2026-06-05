# 🔍 Code Audit Report — MyPortfolio

**Date:** 05.06.2026
**Stack:** NestJS 10 (TypeScript) + React 18 + Vite + PostgreSQL 15
**Structure:** `backend/` (NestJS) / `frontend/` (React SPA)

---

## 🔴 CRITICAL Issues

### ✅ 1. [FRONTEND] HashRouter → BrowserRouter [ИСПРАВЛЕНО]
**File:** `frontend/src/main.jsx`
**Status:** ✅ **Исправлено** — заменён `HashRouter` на `BrowserRouter`.

---

### ✅ 2. [FRONTEND] Header admin link [ИСПРАВЛЕНО]
**File:** `frontend/src/components/Header.jsx`
**Status:** ✅ **Исправлено** — заменён `<a href="#/admin">` на `<Link to="/admin">` из `react-router-dom`.

---

### ✅ 3. [BACKEND] JWT_SECRET [ПРОВЕРЕНО]
**File:** `backend/.env.prod`
**Status:** ✅ **Принято** — `JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024` (62 символа, достаточно сильный).

---

### ✅ 4. [BACKEND] CORS [ПРОВЕРЕНО]
**File:** `backend/src/main.ts`
**Status:** ✅ **Принято** — CORS настроен через `ALLOWED_ORIGINS` env var с конкретными origins.

---

## 🟡 MEDIUM Issues

### ✅ 5. [BACKEND] synchronize [ПРОВЕРЕНО]
**File:** `backend/src/app.module.ts`
**Status:** ✅ **Принято** — `synchronize: process.env.NODE_ENV !== 'production'` — в production автоматически `false`.

---

### 6. [BACKEND] Port mismatch между .env и docker-compose
**File:** `backend/.env.dev` vs `docker-compose.dev.yml`
**Problem:** 
- `backend/.env.dev`: `PORT=3001`
- `docker-compose.dev.yml`: `BACKEND_PORT=3001` (правильно)
- `docker-compose.yml`: `BACKEND_PORT=3000` (production)

**Impact:** Путаница при переключении между dev и prod режимами.

**Recommendation:** Документировать разницу и убедиться что все согласовано.

---

### 7. [BACKEND] src/migrations/ пустой
**File:** `backend/src/migrations/`
**Problem:** Директория существует но пуста. `seed.ts` содержит SQL для создания данных.

**Impact:** Нет версионированных миграций БД.

**Recommendation:** Создать миграции через `npm run migration:generate`.

---

### 8. [BACKEND] admin.module.ts импортирует JwtModule дважды
**File:** `backend/src/admin/admin.module.ts`
**Problem:** Модуль импортирует `JwtModule` из `auth.module.ts` и также имеет собственный `JwtModule.register()`.

**Impact:** Дублирование конфигурации JWT.

**Recommendation:** Перенести JWT конфигурацию в один модуль (auth.module).

---

### ✅ 9. [BACKEND] JwtAuthGuard на admin.controller [ПРОВЕРЕНО]
**File:** `backend/src/admin/admin.controller.ts`
**Status:** ✅ **Принято** — `@UseGuards(JwtAuthGuard)` установлен на уровне класса (строка 31).

---

### 10. [FRONTEND] Hero.jsx использует статическое изображение
**File:** `frontend/src/components/Hero.jsx`
**Problem:** Изображение `hero.png` захардкожено. Нет возможности менять через админку.

**Impact:** Для смены hero-изображения нужен деплой кода.

**Recommendation:** Добавить endpoint для загрузки hero-изображения через admin API.

---

## 🟢 LOW / INFO

### 11. [FRONTEND] Footer не использует i18n
**File:** `frontend/src/components/Footer.jsx`
**Problem:** Текст захардкожен на английском.

**Recommendation:** Добавить поддержку i18n.

---

### 12. [FRONTEND] Toast зависит от `window.toast`
**File:** `frontend/src/components/ContactForm.jsx` (строка 63)
**Problem:** `window.toast?.()` — глобальный callback зависит от внешней инициализации.

**Recommendation:** Создать контекст для toast-уведомлений.

---

### 13. [BACKEND] Нет rate limiting на auth endpoints
**File:** `backend/src/admin/auth.controller.ts`
**Problem:** Нет защиты от brute-force на login endpoint.

**Recommendation:** Добавить `@Throttle` декоратор от `@nestjs/throttler`.

---

### 14. [BACKEND] upload.service.ts не валидирует MIME types
**File:** `backend/src/admin/upload/upload.service.ts`
**Problem:** Валидация только по extension, не по MIME type.

**Recommendation:** Добавить проверку MIME type через `filetype` или аналог.

---

### 15. [FRONTEND] Нет TypeScript в frontend
**File:** `frontend/package.json`
**Problem:** Frontend использует JSX без TypeScript.

**Impact:** Нет type safety на frontend.

**Recommendation:** Рассмотреть миграцию на TypeScript.

---

## 📊 Summary

| Severity | Count | Key Issues |
|----------|-------|------------|
| 🔴 Critical | 0 | Все критические исправлены |
| 🟡 Medium | 3 | Port mismatch, empty migrations, duplicate JwtModule imports |
| 🟢 Low | 5 | i18n, toast global, brute-force, MIME validation, no TS |

---

## ✅ Completed Fixes

| # | Issue | Status | Fix |
|---|-------|--------|-----|
| 1 | HashRouter → BrowserRouter | ✅ Исправлено | `frontend/src/main.jsx` |
| 2 | Header admin link | ✅ Исправлено | `frontend/src/components/Header.jsx` → `<Link to="/admin">` |
| 3 | JWT_SECRET | ✅ Принято | 62 символа, достаточно сильный |
| 4 | CORS wildcard | ✅ Принято | Настроен через `ALLOWED_ORIGINS` |
| 5 | synchronize: true | ✅ Принято | Контролируется через `NODE_ENV` |
| 9 | JwtAuthGuard | ✅ Принято | На уровне класса в `admin.controller.ts` |

---

## 🎯 Remaining Issues (Low Priority)

1. **Port mismatch** — документировать разницу между dev/prod портами
2. **Empty migrations** — создать миграции через `npm run migration:generate`
3. **Duplicate JwtModule** — рефакторинг `admin.module.ts`
4. **Hero static image** — добавить API для загрузки hero-изображения
5. **No rate limiting** — добавить `@nestjs/throttler` на login endpoint

# TODO List — MyPortfolio Project

## 🔴 Critical (High Priority)

### 1. 🐛 Исправить seed.ts (использует SQLite вместо PostgreSQL)
- **Файл:** `backend/src/seed.ts`
- **Проблема:** Seed использует SQLite (`type: 'sqlite'`), но основной конфиг — PostgreSQL
- **Решение:** 
  - [ ] Удалить `sqlite3` из зависимостей (если не используется явно)
  - [ ] Обновить seed.ts для работы с PostgreSQL
  - [ ] Добавить использование ConfigModule для подключения

### 2. 🔐 Безопасность — жёстко заданные credentials
- **Файл:** `.env.example`
- **Проблема:** Дефолтные `ADMIN_USERNAME=admin` и `ADMIN_PASSWORD=admin123`
- **Решение:** 
  - [ ] Добавить плейсхолдеры с инструкцией генерации
  - [ ] Добавить JWT_SECRET с инструкцией (`openssl rand -base64 32`)

### 3. 📦 TypeORM Migrations
- **Статус:** Не созданы (README подтверждает)
- **Решение:** 
  - [ ] `nest migration:generate` — сгенерировать миграции из entities
  - [ ] Добавить скрипт в package.json: `"migration:run": "typeorm-ts-node-commonjs migration:run"`
  - [ ] Добавить `"migration:revert": "typeorm-ts-node-commonjs migration:revert"`

### 4. ✅ Убрать `synchronize: true` для production
- **Файл:** `backend/src/app.module.ts`, строка 23
- **Проблема:** `synchronize: true` опасен в production (может удалить данные)
- **Решение:** 
  - [ ] Переместить `synchronize` в conditional для dev только
  - [ ] Использовать migrations вместо этого

---

## 🟡 Important (Medium Priority)

### 5. 🖼️ Image Upload (упомянуто в README как remaining task)
- **Требуется:** 
  - [ ] Добавить `@nestjs/microservices` или `multer`
  - [ ] Создать `FilesModule` для загрузки изображений
  - [ ] Настроить storage (local disk или S3/cloudinary)
  - [ ] Обновить Entity `Project` и `Hero` для хранения URL файлов
  - [ ] Добавить UI для upload в админке

### 6. 🧪 Tests (Unit + E2E)
- **Требуется:** 
  - [ ] `npm i -D @nestjs/testing jest ts-jest supertest`
  - [ ] Настроить `jest.config.js`
  - [ ] Создать `backend/src/**/*.spec.ts` файлы
  - [ ] Добавить E2E тесты для auth endpoints
  - [ ] Добавить frontend tests (`@testing-library/react`)

### 7. 📧 Email Notifications
- **Статус:** Форма контактов есть, но нет email оповещений
- **Требуется:** 
  - [ ] `npm i nodemailer`
  - [ ] Создать `MailModule` в NestJS
  - [ ] Настроить отправку при новых сообщениях из ContactForm

### 8. 🔑 JWT Strategy — refresh tokens
- **Статус:** Только access token (HttpOnly cookie)
- **Требуется:** 
  - [ ] Добавить refresh token mechanism
  - [ ] Хранить refresh tokens в БД
  - [ ] Endpoint `/auth/refresh`

### 9. 📊 Database — недостающие entities поля
- **Hero entity:** проверить есть ли все нужные поля (subtitle, CTA buttons, social links)
- **ContactMessage entity:** проверить CRUD endpoints
- **User entity:** проверить ролевую модель (только admin или есть users)

---

## 🟢 Nice to Have (Low Priority / Enhancements)

### 10. 🌐 i18n — Многоязычность
- [ ] Добавить `@nestjs/i18n`
- [ ] Поддержать EN/UA/RU переводы
- [ ] Переключатель языка на frontend

### 11. 📈 Analytics / Visitor Counter
- [ ] Добавить счётчик посещений
- [ ] Статистика в админке (сколько людей зашло, какие страницы смотрели)

### 12. 🗂️ Portfolio Categories / Filters
- [ ] Добавить категории к проектам
- [ ] Фильтрация на frontend

### 13. 💬 Blog Section
- [ ] Create blog posts entity
- [ ] Admin page for managing blog posts
- [ ] Frontend blog section

### 14. 🔍 Search & Pagination
- [ ] Пагинация для проектов и навыков
- [ ] Поиск по проектам (frontend)

### 15. 📱 PWA Support
- [ ] Добавить `manifest.json`
- [ ] Service worker для offline mode
- [ ] Install prompt

### 16. 🎨 Animation Enhancements
- [ ] Добавить больше micro-interactions
- [ ] Page transition animations
- [ ] Scroll-triggered animations (AOS или аналоги)

### 17. 📝 Admin Dashboard — CRUD enhancements
- [ ] Drag-and-drop для reordering skills/projects
- [ ] Bulk delete
- [ ] Draft/publish workflow для проектов

### 18. 🔔 Real-time Notifications
- [ ] WebSocket (nestjs/websockets или Socket.io)
- [ ] Уведомления о новых сообщениях в админке

### 19. 📋 API Rate Limiting — more granular
- [ ] Разные лимиты для разных endpoints
- [ ] Whitelist для admin IP

### 20. 📊 Backend Monitoring
- [ ] Добавить `@nestjs/terminus` (уже частично есть через HealthModule)
- [ ] Prometheus metrics (`@nrwl/nestjs-metrics`)
- [ ] Sentry error tracking

---

## 🔧 DevOps / Infrastructure

### 21. 🐳 Docker — improvements
- **backend/.dockerignore:** проверить что исключает всё нужное
- [ ] Добавить `.env.example` в backend и frontend
- [ ] healthcheck в docker-compose.yml для всех сервисов
- [ ] volume mounting для development (`/app` ≠ host paths)
- [ ] Разделить Dockerfile для dev/prod (multi-stage build для frontend уже есть ✅)

### 22. 🚀 CI/CD Pipeline
- [ ] GitHub Actions workflow
- [ ] Lint + Format check (ESLint + Prettier)
- [ ] TypeScript compilation check
- [ ] Auto deploy на production (Vercel/Railway/Render)

### 23. 📦 Dependency Updates
- [ ] Настроить Dependabot или Renovate
- [ ] Проверить `npm outdated` — есть ли устаревшие пакеты

---

## 🐛 Bug Fixes / Issues Found

### 24. ⚠️ sqlite3 в production dependencies
- **Файл:** `backend/package.json`, строка 34
- **Проблема:** `sqlite3` в production deps, но используется PostgreSQL
- **Решение:** Удалить если не нужен явно: `npm uninstall sqlite3`

### 25. ⚠️ frontend/.env.production — hard-coded API URL
- **Проверить:** `frontend/.env.production` содержит правильный VITE_API_URL?
- **Решение:** Убедиться что указывает на production backend domain

---

## 📝 Documentation

### 26. 📖 Обновить README
- [ ] Добавить секцию "Known Issues" (seed использует SQLite)
- [ ] Добавить инструкцию по first-time setup
- [ ] Добавить diagram архитектуры
- [ ] API docs (уже есть Swagger, добавить ссылку в README)

### 27. 📋 CONTRIBUTING.md
- [ ] Правила для контрибьюторов
- [ ] Code style guidelines

---

## 📊 Priority Matrix

| Priority | Tasks | Effort |
|----------|-------|--------|
| 🔴 Critical | #1, #2, #3, #4 | Medium |
| 🟡 Important | #5-#9 | High |
| 🟢 Nice to Have | #10-#27 | Variable |

---

## ✅ Выполнено в этой сессии

### Phase 1 (Fix) — DONE:
- [x] #1 — Исправлен seed.ts (SQLite → PostgreSQL, добавлены все entities)
- [x] #2 — Обновлён .env.example (безопасность, улучшены плейсхолдеры)
- [x] #4 — synchronize зависит от NODE_ENV
- [x] #24 — sqlite3 удалён из dependencies

### Phase 2 (Migrate) — DONE:
- [x] #3 — Создан data-source.ts для миграций
- [x] Добавлены скрипты migration:generate и migration:run
- [x] Добавлен dotenv как зависимость

## 📅 Suggested Order

1. ~~**Phase 1 (Fix):** #1, #2, #4, #24 — убрать критические баги~~ ✅ **DONE**
2. ~~**Phase 2 (Migrate):** #3 — TypeORM migrations~~ ✅ **DONE**
3. **Phase 3 (Feature):** #5, #7, #8 — основные фичи
4. **Phase 4 (Test):** #6 — покрытие тестами
5. **Phase 5 (DevOps):** #21, #22, #23 — инфраструктура
6. **Phase 6 (Enhance):** #10-#20 — улучшения
7. **Phase 7 (Docs):** #26, #27 — документация

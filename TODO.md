# TODO.md — Портфолио Проект

## ✅ Завершено: Стандартизация сущностей, DTO и миграций (05.06.2026)

### Стандартизированные сущности (6 файлов в `backend/src/admin/entities/`)
| Сущность | Статус | Примечание |
|--------|--------|-------|
| `user.entity.ts` | ✅ Стандартизирована | `username`, `password`, `isActive`, `createdAt` |
| `hero.entity.ts` | ✅ Стандартизирована | JSON-поля через `@Column({ type: 'jsonb' })` |
| `skill.entity.ts` | ✅ Стандартизирована | `level` (int), `sortOrder` (int) |
| `project.entity.ts` | ✅ Стандартизирована | `technologies` (массив text), `sortOrder` (int) |
| `contact-message.entity.ts` | ✅ Стандартизирована | `isRead` boolean, `attachments` (jsonb массив) |
| `jwt-blacklist.entity.ts` | ✅ Стандартизирована | Для инвалидации JWT-токенов |
| `index.ts` | ✅ Обновлена | Переэкспортирует все сущности |

### Стандартизированные DTO (11 файлов в `backend/src/admin/dto/`)
| DTO | Тип | Сущность | Статус |
|-----|------|--------|--------|
| `create-hero.dto.ts` | Создание | Hero | ✅ Стандартизирован |
| `update-hero.dto.ts` | Обновление | Hero | ✅ Стандартизирован |
| `create-skill.dto.ts` | Создание | Skill | ✅ Стандартизирован |
| `update-skill.dto.ts` | Обновление | Skill | ✅ Стандартизирован |
| `create-project.dto.ts` | Создание | Project | ✅ Стандартизирован |
| `update-project.dto.ts` | Обновление | Project | ✅ Стандартизирован |
| `create-contact-message.dto.ts` | Создание | ContactMessage | ✅ Стандартизирован |
| `update-contact-message.dto.ts` | Обновление | ContactMessage | ✅ Стандартизирован |
| `change-password.dto.ts` | Аутентификация | User | ✅ Оставлен |
| `login.dto.ts` | Аутентификация | User | ✅ Оставлен |
| `index.ts` | Переэкспорт | - | ✅ Обновлен |

### Удалённые старые/несогласованные файлы
- `backend/src/admin/dto/create.dto.ts` — Старый универсальный DTO для создания
- `backend/src/admin/dto/update.dto.ts` — Старый универсальный DTO для обновления
- `backend/src/admin/dto/admin.dto.ts` — Старый admin DTO
- `backend/src/admin/dto/upload.dto.ts` — Старый upload DTO
- `backend/src/migrations/1780657600000-UnifySchema.ts` — Старая миграция
- `backend/src/migrations/1780673102922-FixEntityTypes.ts` — Старая миграция

### Исправленные файлы конфигурации
- `backend/src/data-source.ts` — Загружает `.env.prod` или `.env.dev` динамически в зависимости от `NODE_ENV`. Путь к миграциям исправлен на `./migrations/`.
- `backend/src/migration/generate.ts` — Рефакторизован для использования общего источника данных из `data-source.ts`.
- `backend/src/migration/run.ts` — Рефакторизован для использования общего источника данных из `data-source.ts`.

### Стратегия миграций
- Сгенерирована чистая начальная миграция `1780684004110-InitialSchema.ts` в `backend/src/migrations/`.
- Создание новой миграции: `npm run migration:generate -- <путь>` (в папке `backend`).
- Применение миграций: `npm run migration:run` (в папке `backend`).


---

## 📋 Задачи в процессе

### Backend
- [x] Создать начальную миграцию из текущих сущностей
- [x] Применить миграцию к базе данных
- [x] Проверить все endpoint'и с новых DTO
- [x] Добавить валидационные декораторы ко всем DTO (`@IsString`, `@IsOptional` и т.д.)
- [x] Добавить `@IsNumber` / `@Min` / `@Max` для числовых полей (`level`, `sortOrder`)
- [x] Добавить валидацию email в DTO `ContactMessage`
- [x] Добавить валидацию размера/типа файлов для загрузок (Multer image file filter)
- [x] Добавить rate limiting для endpoint'ов аутентификации (Throttler в AppModule)
- [x] Добавить логирование в модуль аутентификации (audit-log.interceptor.ts)
- [x] Написать unit-тесты для сервисов
- [ ] Написать e2e-тесты для admin модуля
- [x] Добавить сущность `social-link.entity.ts` и DTO (create/update)

### Frontend
- [x] Обновить admin dashboard под новую структуру DTO (с интеграцией загрузки файлов и корзины)
- [x] Добавить валидацию форм для контактной формы
- [ ] Добавить индикатор прогресса загрузки файлов
- [ ] Добавить error boundaries для страниц
- [x] Добавить loading skeletons для компонентов (SkeletonCard в Admin Dashboard)
- [ ] Добавить улучшения доступности (ARIA-метки, навигация с клавиатуры)
- [ ] Добавить SEO meta-теги (react-helmet-async)
- [x] Добавить сохранение переключателя тёмной темы
- [ ] Добавить поддержку PWA (service worker)
- [x] Добавить компоненты: CoffeeCup, DoodleCanvas, DoodleControls, DoodlyHelper
- [x] Добавить изображения проектов (ecommerce.png, portfolio.png, taskmanager.png, hero.png, hero_avatar.png)
- [x] Добавить утилиту audioSynth.js

### Инфраструктура
- [x] Добавить health check endpoint'и в docker-compose
- [ ] Добавить CI/CD пайплайн (GitHub Actions)
- [ ] Добавить стратегию резервного копирования базы данных
- [ ] Добавить мониторинг (Prometheus/Grafana)
- [ ] Добавить управление SSL-сертификатами
- [ ] Добавить CDN для статических файлов
- [ ] Добавить middleware сжатия
- [x] Добавить CORS конфигурацию для production


### Безопасность
- [ ] Реализовать CSRF-защиту
- [ ] Добавить ограничения на размер тела запроса
- [x] Добавить заголовки helmet.js (через пакет `helmet`)
- [ ] Добавить требования к сложности пароля
- [ ] Добавить блокировку аккаунта после неудачных попыток
- [x] Добавить аудит-логирование действий админа (audit-log.entity.ts + audit-log.interceptor.ts)
- [x] Пересмотреть и обновить CORS-источники
- [ ] Добавить заголовки Content-Security-Policy

### Документация
- [x] Добавить API-документацию (Swagger/OpenAPI)
- [x] Добавить README для настройки backend
- [x] Добавить README для настройки frontend
- [ ] Добавить диаграмму схемы базы данных
- [ ] Добавить руководство по развёртыванию
- [ ] Добавить правила внесения вкладов

---

## 🏗️ Примечания по архитектуре

### Соответствие Сущность → DTO
```
Hero        → create-hero.dto.ts, update-hero.dto.ts
Skill       → create-skill.dto.ts, update-skill.dto.ts
Project     → create-project.dto.ts, update-project.dto.ts
ContactMessage → create-contact-message.dto.ts, update-contact-message.dto.ts
User        → login.dto.ts, change-password.dto.ts
```

### Стратегия JSON-колонок
Все JSON-поля используют `@Column({ type: 'jsonb' })` с:
- `Hero.socialLinks` → `{ github?, linkedin?, twitter? }`
- `Project.technologies` → `string[]`
- `ContactMessage.attachments` → `string[]`

### Соглашение для числовых полей
- `level` → `@Column({ type: 'int', default: 0 })` (шкала 0-100)
- `sortOrder` → `@Column({ type: 'int', default: 0 })` (для сортировки)

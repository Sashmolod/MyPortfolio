# Portfolio Project — Руководство по запуску

## 📁 Структура `.env` файлов

```
.
├── .env.example            ← шаблон переменных окружения (все переменные)
├── .env.development        ← конфигурация для разработки
└── .env.production         ← конфигурация для продакшена
```

> **Важно:** Никогда не коммитьте файлы `.env`! Они находятся в `.gitignore`.

---

## 🚀 Быстрый старт

### DEV (разработка с hot-reload)

```bash
# 1. Настройте окружение
cp .env.example .env.development

# 2. Запустить все сервисы в фоне
npm run docker:dev:d

# 3. Заполнить БД (первый запуск)
docker compose -f docker-compose.dev.yml exec backend npm run seed
```

**Доступ:** Фронтенд: http://localhost:5173 | API: http://localhost:3001/api | Админ: http://localhost:5173/admin

### PROD (продакшен)

```bash
# 1. Настройте окружение
cp .env.example .env.production
# Отредактируйте .env.production (пароли и домены!)

# 2. Собрать образы и запустить
npm run docker:prod:d

# 3. Заполнить БД (по желанию)
docker compose exec backend npm run seed
```

**Доступ:** Фронтенд: http://localhost | API: http://localhost:3001/api | Админ: http://localhost/admin

---

## 📋 Сравнение режимов

| Параметр | DEV (Docker) | PROD (Docker) |
|----------|--------------|---------------|
| Файлы проекта | `volumes: ./frontend:/app`, `./backend:/app` | Встроены в образ при `docker build` |
| Frontend URL | `http://localhost:5173` (Vite Dev) | `http://localhost` (Nginx:80) |
| Backend URL | `http://localhost:3001/api` | `http://localhost:3001/api` |
| Hot-reload | ✅ Да | ❌ Нет |
| Для чего | Разработка | Деплой |

---

## 🔧 Полезные команды

### Запуск и остановка

```bash
# DEV режим
npm run docker:dev              # запустить в foreground (блокирует терминал)
npm run docker:dev:d            # запустить в фоне (detached)
npm run docker:dev:down         # остановить
npm run docker:dev:logs         # просмотр логов

# PROD режим
npm run docker:prod             # запустить в foreground
npm run docker:prod:d           # запустить в фоне
npm run docker:prod:down        # остановить
npm run docker:prod:logs        # просмотр логов
```

### Статус и логи

```bash
# Статус контейнеров
docker compose -f docker-compose.dev.yml ps   # DEV
docker compose ps                              # PROD

# Логи
docker compose -f docker-compose.dev.yml logs -f backend   # DEV
docker compose logs -f backend                             # PROD
```

### Работа с базой данных

```bash
# Заполнить БД начальными данными
docker compose -f docker-compose.dev.yml exec backend npm run seed    # DEV
docker compose exec backend npm run seed                               # PROD

# Подключиться к БД
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d portfolio_db   # DEV
docker compose exec db psql -U postgres -d portfolio_db                              # PROD

# Выполнить запрос напрямую
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d portfolio_db -c "SELECT * FROM users;"
```

### Миграции

```bash
# Создать миграцию (автоматическое определение изменений)
npm run db:migrate:gen

# Применить все неприменённые миграции
npm run db:migrate:run

# Или в Docker (DEV)
docker compose -f docker-compose.dev.yml exec backend npm run migration:generate -d src/data-source.ts
docker compose -f docker-compose.dev.yml exec backend npm run migration:run -d src/data-source.ts
```

### Пересборка и обновление

```bash
# Пересобрать и перезапустить (при изменении Dockerfile или зависимостей)
npm run docker:dev:d  # DEV
npm run docker:prod:d # PROD

# Или с флагом --build
docker compose -f docker-compose.dev.yml up -d --build
```

### Локальная разработка (без Docker)

```bash
# Backend
cd backend && cp .env.example .env && npm install && npm run dev
# http://localhost:3001/api

# Frontend
cd frontend && npm install && npm run dev
# http://localhost:5173
```

Требуется запущенная PostgreSQL на localhost:5432 с БД `portfolio_db`.

---

## 🔐 Безопасность

В production обязательно измените:
1. `POSTGRES_PASSWORD` → сильный пароль
2. `JWT_SECRET` / `JWT_REFRESH_SECRET` → минимум 32 символа
3. `ADMIN_PASSWORD` → надёжный пароль

```bash
# Генерация JWT Secret (64 символа)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Встроенные меры защиты:
* **Блокировка аккаунта**: При 5 неверных попытках входа админ блокируется на 15 минут.
* **Сложность пароля**: От 8 символов, заглавные/строчные буквы, цифры, спецсимволы.
* **CSRF**: `SameSite=Strict` HttpOnly cookies.
* **CSP**: Защита от XSS через Nginx и Express (helmet).
* **Лимиты**: JSON payloads до 2MB, Nginx до 10MB.
* **Gzip**: Сжатие контента на бэкенде и Nginx.

---

## 💾 Бэкап БД

```bash
# Создать бэкап
docker exec portfolio_db_dev pg_dump -U postgres -d portfolio_db | gzip > backups/portfolio_db_backup.sql.gz

# Восстановить из бэкапа
gunzip < backups/portfolio_db_backup.sql.gz | docker exec -i portfolio_db_dev psql -U postgres -d portfolio_db
```

---

## 🗄️ Структура БД

| Таблица | Описание |
|---------|----------|
| `users` | Администраторы |
| `hero` | Блок приветствия |
| `skills` | Навыки |
| `projects` | Проекты |
| `social_links` | Социальные сети |
| `contact_messages` | Сообщения формы |
| `visit_stats` | Статистика посещений |
| `audit_log` | Логи действий админа |
| `jwt_blacklist` | Черный список токенов |
| `settings` | Настройки сайта |

Полная схема: [DB_SCHEMA.md](DB_SCHEMA.md)

---

## 🔄 Миграции

```bash
# Создать миграцию
npm run db:migrate:gen

# Применить миграции
npm run db:migrate:run
```

---

## 🧪 Тесты

```bash
# Запустить все тесты
npm run test

# Только backend
npm run test:backend

# Только frontend
npm run test:frontend
```

---

## 📚 Документация

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) — деплой, SSL, CI/CD
- [DB_SCHEMA.md](DB_SCHEMA.md) — схема БД
- [CONTRIBUTING.md](CONTRIBUTING.md) — правила вклада
- [CODE_AUDIT.md](CODE_AUDIT.md) — аудит кода
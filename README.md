# Portfolio Project — Руководство по запуску

## 📁 Структура `.env` файлов

```
.
├── .env                    ← корневой (для Docker Compose prod)
├── .env.example            ← шаблон переменных окружения
├── .env.dev                ← корневой для dev режима (передаётся в Docker)
├── backend/
│   ├── .env.dev            ← бэкенд в Docker dev сети
│   └── .env.prod           ← бэкенд в Docker prod сети
└── frontend/
    ├── .env.dev            ← настройки для Docker dev (VITE_API_URL=http://backend:3000/api)
    └── .env                ← настройки для Docker prod / локальной разработки
```

---

## 🚀 Режим 1: DEV (Docker Compose — разработка с hot-reload)

Режим для разработки. Все файлы проекта монтируются в контейнеры через `volumes`, NestJS работает в `--watch` режиме, Vite — в dev режиме с HMR.

### Требования
- **OrbStack** или **Docker Desktop** с Docker Compose
- Node.js 18+ (для локальных команд npm)

### Запуск

```bash
# 1. Запустить все сервисы в dev режиме
npm run docker:dev

# Или вручную:
docker compose -f docker-compose.dev.yml up -d

# 2. Заполнить базу данных начальными данными (первый запуск)
docker compose -f docker-compose.dev.yml exec backend npm run seed

# Фронтенд: http://localhost:5173  (Vite Dev Server с HMR)
# Бэкенд API: http://localhost:3000/api
# Админ-панель: http://localhost:5173/admin
```

### Горячая перезагрузка (Hot-reload)
- **Backend**: NestJS работает в `--watch` режиме. При изменении `.ts` файлов контейнер автоматически перезапускается (~2 сек).
- **Frontend**: Vite Dev Server с HMR. При изменении `.jsx/.tsx` файлов браузер обновляется мгновенно без перезагрузки.
- **Не нужно перезапускать Docker** — просто редактируй файлы в `./backend/` или `./frontend/`.

### Остановка
```bash
# Остановить контейнеры (данные сохраняются)
npm run docker:dev:down

# Или вручную:
docker compose -f docker-compose.dev.yml down

# Остановить + удалить volumes (осторожно! все данные будут удалены)
docker compose -f docker-compose.dev.yml down -v
```

### Просмотр логов
```bash
# Все сервисы
docker compose -f docker-compose.dev.yml logs -f

# Конкретный сервис
docker compose -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.dev.yml logs -f frontend
docker compose -f docker-compose.dev.yml logs -f db
```

### Обновление приложения
```bash
# При изменении Dockerfile или зависимостей
docker compose -f docker-compose.dev.yml up -d --build
```

---

## 🐳 Режим 2: PROD (Docker Compose — продакшен)

Режим для деплоя. Образы собираются из Dockerfile, фронтенд раздаётся через Nginx.

### Требования
- Docker Desktop или OrbStack с Docker
- docker-compose v2+

### Запуск всей инфраструктуры

```bash
# 1. Собрать образы и запустить контейнеры
npm run docker:prod

# Или вручную:
docker compose build
docker compose up -d

# 2. Заполнить базу данных начальными данными (по желанию)
docker compose exec backend npm run seed

# Фронтенд: http://localhost (Nginx порт 80)
# Бэкенд API: http://localhost:3000/api
# Админ-панель: http://localhost/admin
```

### Остановка
```bash
# Остановить контейнеры
npm run docker:prod:down

# Или вручную:
docker compose down

# Остановить + удалить volumes (осторожно! все данные будут удалены)
docker compose down -v
```

### Просмотр логов
```bash
# Все сервисы
docker compose logs -f

# Конкретный сервис
docker compose logs -f backend
docker compose logs -f db
docker compose logs -f frontend
```

### Обновление приложения
```bash
# Пересобрать и перезапустить
docker compose up -d --build
```

---

## 📋 Сравнение режимов

| Параметр | DEV (Docker) | PROD (Docker) |
|----------|--------------|---------------|
| Файлы проекта | `volumes: ./frontend:/app`, `./backend:/app` | Встроены в образ при `docker build` |
| Frontend URL | `http://localhost:5173` (Vite Dev Server) | `http://localhost` (Nginx порт 80) |
| Backend URL | `http://localhost:3000/api` | `http://localhost:3000/api` |
| PostgreSQL | Docker service `db` (`db:5432`, порт 5433) | Docker service `db` (`db:5432`, порт 5433) |
| Hot-reload | ✅ Да (NestJS --watch, Vite HMR) | ❌ Нет (пересборка образа) |
| Админ-панель | `http://localhost:5173/admin` | `http://localhost/admin` |
| Для чего | Разработка, тестирование | Деплой на сервер |

---

## 🔧 Полезные команды

### Docker Compose
```bash
# DEV режим
npm run docker:dev              # запустить dev
npm run docker:dev:down         # остановить
docker compose -f docker-compose.dev.yml ps   # статус
docker compose -f docker-compose.dev.yml logs -f backend  # логи

# PROD режим
npm run docker:prod             # запустить prod
npm run docker:prod:down        # остановить
docker compose ps               # статус
docker compose logs -f backend  # логи

# Общие
docker compose -f docker-compose.dev.yml exec backend npm run seed    # заполнить БД (dev)
docker compose exec backend npm run seed                              # заполнить БД (prod)
docker compose -f docker-compose.dev.yml exec db psql -U postgres -d portfolio_db  # подключиться к БД (dev)
docker compose exec db psql -U postgres -d portfolio_db              # подключиться к БД (prod)
```

---

## 🔐 Безопасность и Производительность

**Никогда не коммитьте файлы `.env`!** Они находятся в `.gitignore`.

В production обязательно измените:
1. `POSTGRES_PASSWORD` → сильный пароль
2. `JWT_SECRET` → сгенерируйте случайную строку (не менее 64 символов)
3. `ADMIN_PASSWORD` → надёжный пароль админа

Генерация JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Встроенные меры защиты:
* **Блокировка аккаунта**: Защита от брутфорса — при 5 неверных попытках входа админ блокируется на **15 минут**.
* **Сложность пароля**: Требования к длине (от 8 символов), заглавным/строчным буквам, цифрам и спецсимволам при смене пароля.
* **Защита от CSRF**: Используются `SameSite=Strict` HttpOnly cookies для токенов — браузер автоматически блокирует межсайтовые запросы без необходимости дополнительных заголовков.
* **Заголовки CSP**: Защита от XSS через Content-Security-Policy заголовки на уровне Nginx и Express (helmet).
* **Лимиты на размер запроса**: JSON payloads ограничены до **2MB** на бэкенде. Nginx настроен на **10MB** для поддержки загрузки медиафайлов.
* **Gzip Сжатие**: Сжатие контента на бэкенде и прокси-сервере Nginx для ускорения загрузки.
* **CI/CD Автоматизация**: GitHub Actions воркфлоу запускает линтеры, миграции, юнит- и E2E-тесты в контейнере базы данных при каждом push/PR в `main`.

Подробности настройки и деплоя смотрите в [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md).

---

## 💾 Резерное копирование базы данных

### Скрипт бэкапа
Проект содержит скрипт `scripts/backup.sh` для автоматического создания сжатых резервных копий БД.

```bash
# Сделать скрипт исполняемым (один раз)
chmod +x scripts/backup.sh

# Создать бэкап
./scripts/backup.sh
# или
bash scripts/backup.sh
```

Бэкапы сохраняются в `backups/portfolio_db_backup_YYYY-MM-DD_HH-MM-SS.sql.gz`
Автоматически удаляются бэкапы старше 30 дней.

### Бэкап через Docker
```bash
# Создать бэкап
docker exec portfolio_db_dev pg_dump -U postgres -d portfolio_db | gzip > backups/portfolio_db_backup.sql.gz

# Восстановить из бэкапа
gunzip < backups/portfolio_db_backup.sql.gz | docker exec -i portfolio_db_dev psql -U postgres -d portfolio_db
```

### Восстановление из файла
```bash
# Из .sql.gz
gunzip < backups/portfolio_db_backup_2026-06-06_23-09-12.sql.gz | docker exec -i portfolio_db_dev psql -U postgres -d portfolio_db

# Из .sql
cat backups/portfolio_db_backup.sql | docker exec -i portfolio_db_dev psql -U postgres -d portfolio_db
```

### Просмотр текущих бэкапов
```bash
ls -lh backups/
```

---

## 🐛 Решение проблем

### Порт 5433 уже занят
```bash
# Проверить что слушит порт
lsof -i :5433
# Остановить процесс
kill -9 <PID>
```

---

## 🗄️ Структура базы данных

Проект использует PostgreSQL с TypeORM. Основные таблицы:

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

## 🔄 Миграции базы данных

```bash
# Создать миграцию (изменить схему)
npm run db:migrate:gen

# Применить миграции
npm run db:migrate:run
```

Или напрямую в Docker:
```bash
docker compose -f docker-compose.dev.yml exec backend npm run migration:generate -d src/data-source.ts
docker compose -f docker-compose.dev.yml exec backend npm run migration:run -d src/data-source.ts
```

---

## 💻 Локальная разработка (без Docker)

### Backend
```bash
cd backend
cp .env.dev .env
npm install
npm run dev
# http://localhost:3000/api
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

### Seed данных (первый запуск)
```bash
cd backend
npm run seed
```

Требуется запущенная PostgreSQL на localhost:5432 с БД `portfolio_db`.

---

## 📚 Дополнительная документация

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) — деплой на сервер, SSL, CI/CD
- [DB_SCHEMA.md](DB_SCHEMA.md) — полная схема базы данных
- [CONTRIBUTING.md](CONTRIBUTING.md) — правила внесения вкладов
- [CODE_AUDIT.md](CODE_AUDIT.md) — аудит кода и рекомендации

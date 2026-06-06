# Portfolio Project — Руководство по запуску

## 📁 Структура `.env` файлов

```
.
├── .env                    ← корневой (для Docker Compose prod)
├── .env.example            ← шаблон переменных окружения
├── backend/
│   ├── .env.dev            ← локальный бэкенд (OrbStack PostgreSQL)
│   └── .env.prod           ← бэкенд в Docker сети
└── frontend/
    ├── .env.dev            ← настройки для локальной разработки (VITE_API_URL=/api)
    └── .env.docker         ← настройки для Docker-окружения (VITE_API_URL=/api)
```

---

## 🚀 Режим 1: DEV (локальная разработка)

### Требования
- **OrbStack** с PostgreSQL (сервис `postgres`)
- Node.js 18+
- npm или pnpm

### Запуск PostgreSQL
В OrbStack Dashboard → сервис `postgres`:
- Host: `localhost`
- Port: `5432`
- User: имя твоего ОС-юзера (обычно `hot_pepper`)
- Password: тот, что задал при создании
- Database: `portfolio_db`

### Запуск Backend
```bash
# 1. Убедись что OrbStack PostgreSQL запущен
# 2. Скопируй .env.dev в .env (если нужно)
cd backend
cp .env.dev .env

# 3. Установи зависимости
npm install

# 4. Запусти миграции (создание таблиц)
npm run migration:run

# 5. Запусти seed (заполнение данными)
npm run seed

# 6. Запусти бэкенд в режиме разработки (hot-reload)
npm run start:dev
```


Бэкенд доступен на: `http://localhost:3001`

### Запуск Frontend
```bash
cd frontend

# 1. Скопируй .env.dev
cp .env.dev .env

# 2. Установи зависимости
npm install

# 3. Запусти Vite Dev Server
npm run dev
```

Фронтенд доступен на: `http://localhost:5173` (или 5174, если 5173 занят)

### Админ-панель
URL: `http://localhost:5173/admin` (или `http://localhost/admin` для Docker PROD)
- Login: `admin`
- Password:
  - В DEV режиме: `admin123` (берется из `backend/.env.dev`)
  - В PROD режиме: `admin` (дефолтное значение в `docker-compose.yml`)

---

## 🐳 Режим 2: PROD (Docker Compose — всё в контейнерах)

### Требования
- Docker Desktop или OrbStack с Docker
- docker-compose v2+

### Запуск всей инфраструктуры
```bash
# 1. Убедись что .env содержит параметры для Docker
# POSTGRES_USER=postgres
# POSTGRES_PASSWORD=<твой_пароль>
# POSTGRES_DB=portfolio_db

# 2. Собрать образы
docker compose build

# 3. Запустить контейнеры
docker compose up -d

# 4. Заполнить базу данных начальными данными (по желанию)
docker compose exec backend npm run seed

# Фронтенд: http://localhost
# Бэкенд API: http://localhost:3000/api
# База данных: docker-compose service 'db' (порт 5432 на хосте 5433)
```

### Остановка
```bash
# Остановить контейнеры
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

| Параметр | DEV (локально) | PROD (Docker) |
|----------|----------------|---------------|
| API / Загрузки (клиент) | `/api` и `/uploads` (через прокси Vite на порт 3001) | `/api` и `/uploads` (через прокси Nginx на порт 3000) |
| Frontend URL | `http://localhost:5173` | `http://localhost` (Nginx порт 80) |
| PostgreSQL | OrbStack (`localhost:5432`) | Docker service `db` (`db:5432`) |
| Hot-reload | ✅ Да | ❌ Нет (пересборка образа) |
| Админ-панель | `http://localhost:5173/admin` | `http://localhost/admin` |
| Бэкенд порт | 3001 | 3000 (внутри контейнера), 3000 (хост) |

---

## 🔧 Полезные команды

### Локальная разработка
```bash
# Backend
cd backend && npm run start:dev                       # запустить бэкенд
cd backend && npm run seed                           # заполнить БД
cd backend && npm run migration:generate -- <путь>   # создать миграцию (например, npm run migration:generate -- src/migrations/InitialSchema)
cd backend && npm run migration:run                  # применить миграции
cd backend && npm run migration:revert               # откатить последнюю миграцию

# Frontend
cd frontend && npm run dev                           # запустить фронтенд
cd frontend && npm run build                         # собрать production-версию
```


### Docker
```bash
docker compose up -d              # запустить
docker compose down               # остановить
docker compose ps                 # статус контейнеров
docker exec -it portfolio_db psql -U postgres -d portfolio_db  # подключиться к БД через Docker
docker compose logs -f backend    # логи бэкенда
```

### PostgreSQL (локально)
```bash
# Подключение к OrbStack
psql -h localhost -U hot_pepper -d portfolio_db

# Создание базы если не существует
createdb portfolio_db
```

---

## 🔐 Безопасность

**Никогда не коммить файлы `.env`!** Они в `.gitignore`.

В production измени:
1. `POSTGRES_PASSWORD` → сильный пароль
2. `JWT_SECRET` → сгенерируй случайную строку
3. `ADMIN_PASSWORD` → надёжный пароль админа

Генерация JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🐛 Решение проблем

### Порт 5432 уже занят
```bash
# Проверить что слушает порт
lsof -i :5432

# Если конфликт — измени порт в OrbStack (настройки сервиса postgres)
# и обнови backend/.env.dev: POSTGRES_PORT=<новый_порт>
```

### Бэкенд не подключается к БД
```bash
# Проверь подключение из бэкенда
docker compose exec backend wget -qO- http://db:5432 || echo "Connection failed"

# Для локального запуска проверь OrbStack
psql -h localhost -U hot_pepper -d portfolio_db -c "SELECT 1"
```

### Frontend не видит API
Убедитесь, что переменная `VITE_API_URL` в файлах `.env.dev` и `.env.docker` настроена на относительный адрес:
```
VITE_API_URL=/api
```
Перенаправление (проксирование) запросов к API и папке загрузок `/uploads` осуществляется автоматически:
- В локальной разработке (**DEV**): Vite перенаправляет запросы `/api` и `/uploads` на бэкенд `http://localhost:3001` (настройки в `vite.config.js`).
- В контейнерах (**PROD**): Nginx проксирует запросы `/api/` и `/uploads/` на бэкенд-контейнер `backend:3000` (настройки в `nginx.conf`).

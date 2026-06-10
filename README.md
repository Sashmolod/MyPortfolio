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

## 🐛 Решение проблем

### Порт 5433 уже занят
```bash
# Проверить что слушит порт
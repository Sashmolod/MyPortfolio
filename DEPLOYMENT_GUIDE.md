# Руководство по деплою — Portfolio Project

Это руководство содержит инструкции по сборке, деплою, резервному копированию и защите проекта Portfolio в продакшен-среде (например, Linux VPS) с использованием Docker Compose, настройке безопасного HTTPS через Nginx и Certbot, а также автоматизации резервных копий.

---

## 1. Требования

Перед деплоем убедитесь, что на целевом сервере установлены:
- **Docker** (версия 20.10+)
- **Docker Compose** (версия 2.0+)
- **Git**

---

## 2. Конфигурация окружения

Подготовьте переменные окружения для продакшена. Создайте файл `.env` в корневой директории проекта:

```bash
# PostgreSQL
POSTGRES_USER=your_secure_db_user
POSTGRES_PASSWORD=your_super_secure_db_password
POSTGRES_DB=portfolio_db
POSTGRES_HOST=db
POSTGRES_PORT=5432
DATABASE_URL=postgresql://your_secure_db_user:your_super_secure_db_password@db:5432/portfolio_db

# Backend & Security
BACKEND_PORT=3000
NODE_ENV=production
# Сгенерируйте безопасную случайную строку (64 символа):
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_generated_secure_64_char_jwt_secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://yourportfolio.com

# Учётные данные первого админа (сидируются при первом запуске)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_highly_secure_admin_password_123!

# AI Ассистент
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 3. Запуск через Docker Compose

Проект полностью контейнеризован. Запустите стек (База данных, NestJS Backend, React Frontend через Nginx):

```bash
# Собрать образы и запустить сервисы в фоновом режиме
docker-compose up -d --build
```

### Проверка здоровья сервисов

Проверьте статус запущенных контейнеров:
```bash
docker ps
```

Должны отображаться три healthy контейнера:
- `portfolio_frontend` (раздаёт SPA и работает как reverse-proxy на порту 80/443)
- `portfolio_backend` (запускает NestJS API на внутреннем порту 3000)
- `portfolio_db` (запускает PostgreSQL 16 на порту 5432)

---

## 4. Настройка Nginx Reverse Proxy на уровне хоста (Рекомендуется для SSL)

Для полной продакшен-безопасности рекомендуется запускать Nginx на хост-машине для проксирования запросов в Docker-сеть и управления SSL-сертификатами.

### A. Установка Nginx и Certbot

На Ubuntu/Debian:
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx -y
```

### B. Настройка Server Block

Создайте файл конфигурации Nginx по пути `/etc/nginx/sites-available/portfolio` с правилами reverse proxy, указывающими на Docker-сервисы:

```nginx
server {
    listen 80;
    server_name yourportfolio.com www.yourportfolio.com;

    # Backend API proxy
    location /api {
        proxy_pass http://127.0.0.1:3000/api;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads folder proxy
    location /uploads {
        proxy_pass http://127.0.0.1:3000/uploads;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header Host $host;
    }

    # Frontend SPA proxy
    location / {
        proxy_pass http://127.0.0.1:80;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Включите конфигурацию и перезапустите Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/portfolio /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### C. Получение SSL (HTTPS) сертификатов

Запустите Certbot для получения и автоматической настройки сертификатов Let's Encrypt:
```bash
sudo certbot --nginx -d yourportfolio.com -d www.yourportfolio.com
```

Следуйте интерактивным подсказкам. Certbot автоматически перепишет конфигурацию Nginx для поддержки безопасных HTTPS-перенаправлений на порту 443.

---

## 5. Автоматизированные резервные копии базы данных

Скрипт бэкапа доступен по пути [scripts/backup.sh](file:///Users/hot_pepper/MyProjectGitHub/MyPortfolio/scripts/backup.sh). Он создаёт дамп базы данных, сжимает его через gzip и удаляет бэкапы старше 30 дней.

### Настройка Cron-задачи

Для автоматизации ночных бэкапов (например, в 2:00 AM), отредактируйте root crontab на хост-машине:

```bash
sudo crontab -e
```

Добавьте следующую строку (замените путь на корневую папку вашего проекта):
```bash
0 2 * * * /bin/bash /path/to/MyPortfolio/scripts/backup.sh >> /path/to/MyPortfolio/backups/backup.log 2>&1
```

Убедитесь, что скрипт имеет права на выполнение:
```bash
chmod +x /path/to/MyPortfolio/scripts/backup.sh
```

---

## 6. Встроенные меры защиты и производительности

Приложение включает несколько защитных механизмов уровня продакшена:

- **Блокировка аккаунта**: После 5 последовательных неудачных попыток входа, аккаунт администратора блокируется на **15 минут** для предотвращения brute-force атак.
- **Сложность пароля**: Пароли администратора должны соответствовать требованиям сложности (мин. 8 символов, 1 заглавная, 1 строчная, 1 цифра, 1 спецсимвол).
- **Лимиты запросов**: Лимиты JSON payload глобально ограничены до **2MB** в NestJS для предотвращения исчерпания памяти. Nginx поддерживает до **10MB** только для загрузки файлов (`client_max_body_size 10M`).
- **CSRF защита**: JWT токены хранятся в `SameSite=Strict` HttpOnly cookies. Браузер автоматически отклоняет межсайтовые запросы, что исключает необходимость в дополнительных заголовках.
- **CSP заголовки**: Content-Security-Policy заголовки применяются на уровне прокси Nginx и NestJS Helmet middleware для предотвращения XSS.
- **Gzip сжатие**: Ответы бэкенда и ресурсы фронтенда сжимаются через Gzip для быстрой загрузки.
- **CI/CD воркфлоу**: Каждый pull request и push в ветку `main` запускает автоматизированный тестовый раннер (Unit и E2E тесты в контейнере Postgres) для обеспечения отсутствия регрессий.
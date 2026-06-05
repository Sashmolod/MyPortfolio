#!/bin/sh
set -e

# ============================================
# Docker Entrypoint для Backend
# Запускает миграции БД перед стартом приложения
# ============================================

echo "🔄 Checking database migrations..."

# Проверяем, есть ли необходимые переменные окружения
if [ -z "$POSTGRES_HOST" ]; then
  echo "❌ POSTGRES_HOST is not set"
  exit 1
fi

if [ -z "$POSTGRES_USER" ]; then
  echo "❌ POSTGRES_USER is not set"
  exit 1
fi

if [ -z "$POSTGRES_DB" ]; then
  echo "❌ POSTGRES_DB is not set"
  exit 1
fi

# Проверяем пароль (может быть пустым для некоторых конфигураций)
# Не выходим с ошибкой если пароль пустой — TypeORM обработает это сам

# Ждем пока база данных будет готова
MAX_RETRIES=30
RETRY_COUNT=0
while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
  if pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" > /dev/null 2>&1; then
    echo "✅ Database is ready"
    break
  fi
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "⏳ Waiting for database... (attempt $RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ Database is not ready after $MAX_RETRIES attempts"
  exit 1
fi

# Запускаем миграции через ts-node из TypeScript источников
# Используем ts-node чтобы избежать ESM/CommonJS конфликтов с compiled JS
echo "📦 Running database migrations..."
npx ts-node -r tsconfig-paths/register src/migration/run.ts

if [ $? -eq 0 ]; then
  echo "✅ Database migrations completed successfully"
else
  echo "❌ Database migrations failed"
  exit 1
fi

# Запускаем приложение
echo "🚀 Starting NestJS application..."
exec node dist/main

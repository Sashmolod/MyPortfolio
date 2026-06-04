# ============================================
# Stage 1: Сборка (Build)
# Используем node:20-alpine как легковесный образ для сборки
# ============================================
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json для кэширования зависимостей
# Это позволяет Docker использовать кэш слоев, если зависимости не изменились
COPY package*.json ./

# Устанавливаем все зависимости (включая devDependencies для сборки)
RUN npm ci

# Копируем исходный код
COPY . .

# Выполняем сборку NestJS проекта
# nest build создает оптимизированный JavaScript-бандл в папке dist/
RUN npm run build

# ============================================
# Stage 2: Запуск (Production)
# Используем минимальный образ для уменьшения размера итогового образа
# ============================================
FROM node:20-alpine AS production

# Устанавливаем рабочую директорию
WORKDIR /app

# Создаем группы и пользователей для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Копируем только package.json для установки production-зависимостей
COPY package*.json ./

# Устанавливаем ТОЛЬКО production-зависимости
# --omit=dev исключает devDependencies, что значительно уменьшает размер образа
RUN npm ci --omit=dev && \
    # Очищаем npm кэш после установки
    npm cache clean --force

# Копируем собранную aplicación из builder этапа
COPY --from=builder /app/dist ./dist

# Меняем владельца файлов на неис privileged пользователя
RUN chown -R nodejs:nodejs /app

# Переключаемся на неб rooted пользователя
USER nodejs

# Открываем порт NestJS приложения
EXPOSE 3000

# Healthcheck: проверяем, что процесс запущен каждые 30 секунд
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/portfolio/public', (r) => { r.statusCode === 200 ? process.exit(0) : process.exit(1); }).on('error', () => process.exit(1))"

# Команда запуска приложения в production режиме
CMD ["node", "dist/main"]
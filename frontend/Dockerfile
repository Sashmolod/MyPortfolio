# ============================================
# Stage 1: Сборка (Build)
# Собираем React приложение с помощью Vite
# ============================================
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json для кэширования зависимостей
COPY package*.json ./

# Устанавливаем все зависимости
RUN npm ci

# Копируем исходный код
COPY . .

# Собираем статический бандл для production
# Vite создает оптимизированные файлы в папке dist/
RUN npm run build

# ============================================
# Stage 2: Запуск (Production)
# Отдаваем статику через легковесный Nginx
# ============================================
FROM nginx:alpine AS production

# Копируем кастомную конфигурацию Nginx
# Настроена для корректной работы с React Router (SPA fallback)
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранную статику из builder этапа в папку Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем публичные файлы (фавиконки, иконки)
COPY --from=builder /app/public /usr/share/nginx/html

# Открываем порт Nginx
EXPOSE 80

# Healthcheck: проверяем, что Nginx отвечает
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:80/ || exit 1

# Команда запуска Nginx в foreground режиме
CMD ["nginx", "-g", "daemon off;"]
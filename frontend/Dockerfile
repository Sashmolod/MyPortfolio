# ============================================
# Stage 1: Сборка (Build)
# Собираем React приложение с помощью Vite
# ============================================
FROM node:20-alpine AS builder

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json для кэширования зависимостей
COPY package*.json ./

# Устанавливаем все зависимости (legacy-peer-deps для обхода peer-конфликтов)
RUN npm install --legacy-peer-deps

# Копируем исходный код
COPY . .

# Собираем статический бандл для production
# Vite создает оптимизированные файлы в папке dist/
RUN npm run build

# ============================================
# Stage 2: Development
# Запускаем Vite dev server для hot reload
# ============================================
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .

# Переменные окружения для HMR и проксирования
ENV DOCKER_DEV=true
ENV VITE_API_URL=http://backend:3000/api

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ============================================
# Stage 3: Запуск (Production)
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
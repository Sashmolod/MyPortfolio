import { INestApplication, ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import express, { Router } from 'express';
import compression from 'compression';
import { CsrfMiddleware } from '../admin/csrf.middleware';
import * as path from 'path';

export function setupMiddlewares(app: INestApplication) {
  // ==========================================
  // Лимиты на размер запроса и сжатие
  // ==========================================
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ limit: '2mb', extended: true }));
  app.use(compression());

  // ==========================================
  // Helmet - безопасные HTTP заголовки и CSP
  // ==========================================
  const isProd = process.env.NODE_ENV === 'production';
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: isProd
            ? ["'self'"]
            : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: isProd
            ? ["'self'", "https://fonts.googleapis.com"]
            : ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: isProd
            ? ["'self'", "https://fonts.gstatic.com"]
            : ["'self'", "data:", "https://fonts.gstatic.com"],
          imgSrc: isProd
            ? ["'self'", "https://placehold.co", "https://*.placehold.co", "https://*.gravatar.com"]
            : ["'self'", "data:", "https://placehold.co", "https://*.placehold.co", "https://*.gravatar.com"],
          connectSrc: [
            "'self'",
            "http://localhost:*",
            "ws://localhost:*",
            "http://127.0.0.1:*",
            "ws://127.0.0.1:*"
          ],
          frameAncestors: ["'none'"],
        },
      },
      frameguard: { action: 'deny' },
    }),
  );

  // Cookie parser middleware - необходим для чтения HttpOnly cookie
  app.use(cookieParser());

  // ==========================================
  // CSRF protection для auth endpoints
  // ==========================================
  // CSRF middleware применяется только к auth routes (login, logout, refresh, change-password)
  // GET, HEAD, OPTIONS запросы не требуют CSRF token
  app.use('/api/auth', new CsrfMiddleware().use.bind(new CsrfMiddleware()));

  // Валидация DTO с transform (авто-преобразование типов)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Статические файлы загрузки
  app.use('/uploads', Router().use(express.static(path.join(__dirname, '..', '..', 'uploads'))));
}

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import express, { Router } from 'express';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as path from 'path';
import compression from 'compression';
import { CsrfMiddleware } from './admin/csrf.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const configService = app.get(ConfigService);

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

  // ==========================================
  // Валидация JWT_SECRET на старте
  // ==========================================
  const jwtSecret = configService.get<string>('JWT_SECRET');
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('FATAL: JWT_SECRET must be defined in the environment and be at least 32 characters long for production security.');
  }

  // ==========================================
  // Валидация JWT_REFRESH_SECRET на старте
  // ==========================================
  const jwtRefreshSecret = configService.get<string>('JWT_REFRESH_SECRET');
  if (!jwtRefreshSecret || jwtRefreshSecret.length < 32) {
    throw new Error('FATAL: JWT_REFRESH_SECRET must be defined in the environment and be at least 32 characters long for production security.');
  }

  // Включение CORS для фронтенда
  // Читаем из env: ALLOWED_ORIGINS через запятую, или используем дефолт
  const allowedOriginsSetting = configService.get<string>('ALLOWED_ORIGINS') || '';
  const allowedOrigins = allowedOriginsSetting
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  // Базовые порты локальной разработки фронтенда
  const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://localhost:80',
    'http://frontend',
  ];

  // Всегда разрешаем базовые локальные адреса
  const corsOrigins = Array.from(
    new Set([
      'http://localhost:5173',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:3000',
      ...(allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins),
    ]),
  );

  app.enableCors({
    origin: (origin, callback) => {
      // В production — разрешаем запросы без origin для healthcheck (wget/curl)
      // Разрешаем только конкретные доверенные origin для браузерных запросов
      if (!origin) {
        // Разрешаем запросы без origin: healthcheck, server-to-server, CLI tools
        callback(null, true);
        return;
      }
      if (corsOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // Cookie parser middleware - необходим для чтения HttpOnly cookie
  app.use(cookieParser());

  // ==========================================
  // CSRF protection для auth endpoints
  // ==========================================
  // CSRF middleware применяется только к auth routes (login, logout, refresh, change-password)
  // GET, HEAD, OPTIONS запросы не требуют CSRF token
  app.use('/api/auth', new CsrfMiddleware().use.bind(new CsrfMiddleware()));

  // Глобальный префикс API
  app.setGlobalPrefix('api');

  // Валидация DTO с transform (авто-преобразование типов)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ==========================================
  // Swagger configuration (только для non-production окружения)
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Portfolio API')
      .setDescription('API documentation for Portfolio with Admin Panel & JWT Auth')
      .setVersion('2.0')
      .addTag('portfolio', 'Public portfolio endpoints')
      .addTag('admin', 'Admin panel endpoints (JWT required)')
      .addTag('auth', 'Authentication endpoints')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter your JWT token from /api/auth/login',
          in: 'header',
        },
        'jwt-in-header', // имя для использования в @ApiBearerAuth('jwt-in-header')
      )
      .addCookieAuth('AccessToken', {
        type: 'http',
        description: 'JWT token from HttpOnly cookie (auto-sent by browser)',
      })
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // Swagger UI доступен по адресу /docs
    SwaggerModule.setup('docs', app, document, {
      customCss: '.swagger-ui .topbar { display: none }',
    });
  }

  // Статические файлы загрузки
  app.use('/uploads', Router().use(express.static(path.join(__dirname, '..', 'uploads'))));

  const port = configService.get<number>('PORT') || 3001;

  await app.listen(port);
  console.log(`\n🚀 Backend running on http://localhost:${port}`);
  console.log(`📖 Swagger UI available at http://localhost:${port}/docs\n`);
}

bootstrap();

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { setupMiddlewares } from './middleware';
import { setupSwagger } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const configService = app.get(ConfigService);

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

  // Настройка middleware и статических файлов
  setupMiddlewares(app);

  // ==========================================
  // Включение CORS для фронтенда
  // ==========================================
  const allowedOriginsSetting = configService.get<string>('ALLOWED_ORIGINS') || '';
  const allowedOrigins = allowedOriginsSetting
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  const isProd = process.env.NODE_ENV === 'production';

  app.enableCors({
    origin: (origin, callback) => {
      // Разрешаем запросы без origin (healthcheck, server-to-server)
      if (!origin) {
        callback(null, true);
        return;
      }

      // В production разрешаем ТОЛЬКО явно указанные ALLOWED_ORIGINS
      if (isProd) {
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
        return;
      }

      // В development используем ALLOWED_ORIGINS, если они заданы.
      // Если переменная пуста — автоматически разрешаем любые локальные запросы с localhost:* или 127.0.0.1:*
      if (allowedOrigins.length > 0) {
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      } else {
        const isLocal = origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:');
        if (isLocal) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // Глобальный префикс API
  app.setGlobalPrefix('api');

  // Настройка Swagger (только для non-production окружения)
  setupSwagger(app);

  const port = configService.get<number>('PORT') || 3001;

  await app.listen(port);
  console.log(`\n🚀 Backend running on http://localhost:${port}`);
  console.log(`📖 Swagger UI available at http://localhost:${port}/docs\n`);
}

bootstrap();

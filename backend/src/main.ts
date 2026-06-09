import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import express from 'express';
import * as bcryptjs from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import * as path from 'path';
import { User } from './admin/entities/user.entity';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // ==========================================
  // Helmet - безопасные HTTP заголовки
  // ==========================================
  app.use(helmet());

  // ==========================================
  // Валидация JWT_SECRET на старте
  // ==========================================
  const jwtSecret = configService.get<string>('JWT_SECRET');
  if (!jwtSecret || jwtSecret.length < 32) {
    throw new Error('FATAL: JWT_SECRET must be defined in the environment and be at least 32 characters long for production security.');
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
      'http://localhost',
      'http://127.0.0.1',
      ...(allowedOrigins.length > 0 ? allowedOrigins : defaultOrigins),
    ]),
  );

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like curl, Postman, mobile apps)
      if (!origin) {
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
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  // Cookie parser middleware - необходим для чтения HttpOnly cookie
  app.use(cookieParser());

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
  // Swagger configuration (после global prefix)
  // ==========================================
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

  // Статические файлы загрузки
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  const port = configService.get<number>('PORT') || 3001;

  await app.listen(port);
  console.log(`\n🚀 Backend running on http://localhost:${port}`);
  console.log(`📖 Swagger UI available at http://localhost:${port}/docs\n`);

  // ==========================================
  // Авто-создание первого администратора при запуске
  // ==========================================
  const adminUsername = configService.get<string>('ADMIN_USERNAME');
  const adminPassword = configService.get<string>('ADMIN_PASSWORD');

  if (adminUsername && adminPassword) {
    try {
      const saltRounds = 12;
      const hashedPassword = bcryptjs.hashSync(adminPassword, saltRounds);

      // Получаем DataSource из Dependency Injection
      const dataSource = app.get(DataSource);
      const userRepo = dataSource.getRepository(User);

      // Проверяем есть ли уже пользователи
      const existingUserCount = await userRepo.count();
      
      if (existingUserCount === 0) {
        // Создаём первого администратора
        await userRepo.save(
          userRepo.create({
            username: adminUsername,
            password: hashedPassword,
            isActive: true,
          })
        );
        
        console.log(`\n✅ Первый администратор создан: ${adminUsername}`);
      } else {
        // Проверяем существует ли пользователь с таким username
        const existingUser = await userRepo.findOne({ where: { username: adminUsername } });
        if (existingUser) {
          // Обновляем пароль
          await userRepo.update(existingUser.id, { password: hashedPassword });
          console.log(`\n🔑 Пароль администратора ${adminUsername} обновлён`);
        } else {
          // Создаём нового пользователя с указанным username
          await userRepo.save(
            userRepo.create({
              username: adminUsername,
              password: hashedPassword,
              isActive: true,
            })
          );
          console.log(`\n✅ Администратор создан: ${adminUsername}`);
        }
      }
      
      console.log(`\n💡 Для входа используйте логин: ${adminUsername}. Пароль задайте в ADMIN_PASSWORD из .env файла.\n`);
    } catch (error: any) {
      console.error(`\n❌ Ошибка при создании администратора:`, error?.message || error);
    }
  } else {
    console.log(`\n⚠️ ADMIN_USERNAME и ADMIN_PASSWORD не заданы в backend/.env`);
    console.log(`💡 Добавьте в backend/.env:`);
    console.log(`   ADMIN_USERNAME=admin`);
    console.log(`   ADMIN_PASSWORD=your-password\n`);
  }
}

bootstrap();

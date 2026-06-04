import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
const cookieParser = require('cookie-parser');
import { AppModule } from './app.module';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Включение CORS для фронтенда
  // Собираем все возможные источники (dev + Docker + локальный запуск)
  const origins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:3000',
    'http://localhost:80',
    'http://frontend',
    'http://127.0.0.1',
  ];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like curl, Postman, mobile apps)
      if (!origin) {
        callback(null, true);
        return;
      }
      if (origins.indexOf(origin) !== -1 || origin.startsWith('http://localhost')) {
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
  app.use('/uploads', require('express').static(path.join(__dirname, '..', 'uploads')));

  const port = process.env.PORT || 3001;

  await app.listen(port);
  console.log(`\n🚀 Backend running on http://localhost:${port}`);
  console.log(`📖 Swagger UI available at http://localhost:${port}/docs\n`);

  // ==========================================
  // Авто-создание первого администратора при запуске
  // Если в .env заданы ADMIN_USERNAME и ADMIN_PASSWORD — создаётся/обновляется пользователь
  // ==========================================
  // Получаем DataSource из Dependency Injection NestJS
  const dataSource = app.get(DataSource);
  const userRepo = dataSource.getRepository('User');
  
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (adminUsername && adminPassword) {
    try {
      const bcrypt = await import('bcrypt');
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
      
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
      
      console.log(`💡 Для входа используйте логин: ${adminUsername} и пароль: ${adminPassword}\n`);
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

import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
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
}

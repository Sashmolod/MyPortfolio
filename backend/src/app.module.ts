import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from './admin/admin.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { HealthModule } from './health.module';
import { UploadModule } from './admin/upload/upload.module';

@Module({
  imports: [
    // Глобальная конфигурация из .env файла
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      username: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DB || 'portfolio_db',
      autoLoadEntities: true, // Автоматически загружает все @Entity декорированные классы
      synchronize: process.env.NODE_ENV !== 'production', // В production использовать migrations!
    }),
    AdminModule,
    PortfolioModule,
    HealthModule,
    UploadModule,
  ],
})
export class AppModule {}
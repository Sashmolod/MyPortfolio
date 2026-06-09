import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AdminModule } from './admin/admin.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { HealthModule } from './health.module';
import { StatsModule } from './stats/stats.module';

@Module({
  imports: [
    // Глобальная конфигурация из .env файла
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev',
    }),
    // Глобальный rate limiting
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 1000,
          limit: 10,
        },
        {
          name: 'default',
          ttl: 60000,
          limit: 60,
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('POSTGRES_HOST') || 'localhost',
        port: parseInt(configService.get<string>('POSTGRES_PORT') || '5432', 10),
        username: configService.get<string>('POSTGRES_USER') || 'postgres',
        password: configService.get<string>('POSTGRES_PASSWORD') || 'postgres',
        database: configService.get<string>('POSTGRES_DB') || 'portfolio_db',
        autoLoadEntities: true, // Автоматически загружает все @Entity декорированные классы
        synchronize: false, // ВНИМАНИЕ: В production всегда false! Используйте migrations для изменений схемы
      }),
    }),
    AdminModule,
    PortfolioModule,
    HealthModule,
    StatsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
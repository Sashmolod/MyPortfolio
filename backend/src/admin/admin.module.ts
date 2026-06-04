import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Skill } from './entities/skill.entity';
import { Project } from './entities/project.entity';
import { ContactMessage } from './entities/contact-message.entity';
import { User } from './entities/user.entity';
import { Hero } from './entities/hero.entity';
import { AuthModule } from './auth.module';

@Global() // Делает exports доступными глобально
@Module({
  imports: [
    TypeOrmModule.forFeature([Skill, Project, ContactMessage, User, Hero]),
    AuthModule,
    // Rate limiting: 10 запросов за 60 секунд для всех endpoints
    ThrottlerModule.forRoot({
      throttlers: [
        {
          name: 'short',
          ttl: 1000, // 1 секунда
          limit: 3, // максимум 3 запроса в секунду
        },
        {
          name: 'long',
          ttl: 60 * 1000, // 60 секунд (1 минута)
          limit: 100, // максимум 100 запросов в минуту
        },
      ],
    }),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService, TypeOrmModule],
})
export class AdminModule {}

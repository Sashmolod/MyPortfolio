import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Skill } from './entities/skill.entity';
import { Project } from './entities/project.entity';
import { ContactMessage } from './entities/contact-message.entity';
import { User } from './entities/user.entity';
import { Hero } from './entities/hero.entity';
import { AuditLog } from './entities/audit-log.entity';
import { AuthModule } from './auth.module';
import { UploadModule } from './upload/upload.module';

@Global() // Делает exports доступными глобально
@Module({
  imports: [
    TypeOrmModule.forFeature([Skill, Project, ContactMessage, User, Hero, AuditLog]),
    AuthModule,
    UploadModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService, TypeOrmModule],
})
export class AdminModule {}
import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SeedService } from './seed.service';
import { Skill } from './entities/skill.entity';
import { SkillCategory } from './entities/skill-category.entity';
import { Project } from './entities/project.entity';
import { ContactMessage } from './entities/contact-message.entity';
import { User } from './entities/user.entity';
import { Hero } from './entities/hero.entity';
import { AuditLog } from './entities/audit-log.entity';
import { SocialLink } from './entities/social-link.entity';
import { Settings } from './entities/settings.entity';
import { AuthModule } from './auth.module';
import { UploadModule } from './upload/upload.module';
import { SkillCategoryModule } from './skill-category.module';

@Global() // Делает exports доступными глобально
@Module({
  imports: [
    TypeOrmModule.forFeature([Skill, SkillCategory, Project, ContactMessage, User, Hero, AuditLog, SocialLink, Settings]),
    AuthModule,
    UploadModule,
    SkillCategoryModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, SeedService],
  exports: [AdminService, TypeOrmModule],
})
export class AdminModule {}

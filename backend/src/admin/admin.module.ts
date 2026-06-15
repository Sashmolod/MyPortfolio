import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SeedService } from './seed.service';
import { Skill, SkillCategory, Project, ContactMessage, User, Hero, AuditLog, SocialLink, Settings } from '../shared/entities';
import { AuthModule } from './auth.module';
import { UploadModule } from './upload/upload.module';
import { SkillCategoryModule } from './skill-category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill, SkillCategory, Project, ContactMessage, User, Hero, AuditLog, SocialLink, Settings]),
    AuthModule,
    UploadModule,
    SkillCategoryModule,
  ],
  controllers: [AdminController],
  providers: [AdminService, SeedService],
  exports: [AdminService],
})
export class AdminModule {}

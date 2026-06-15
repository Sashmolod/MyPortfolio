import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillCategory, Skill } from '../shared/entities';
import { SkillCategoryService } from './skill-category.service';
import { SkillCategoryController } from './skill-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SkillCategory, Skill])],
  providers: [SkillCategoryService],
  controllers: [SkillCategoryController],
  exports: [SkillCategoryService],
})
export class SkillCategoryModule {}
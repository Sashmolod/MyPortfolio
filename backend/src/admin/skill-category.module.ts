import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SkillCategory } from './entities/skill-category.entity';
import { Skill } from './entities/skill.entity';
import { SkillCategoryService } from './skill-category.service';
import { SkillCategoryController } from './skill-category.controller';

@Module({
  imports: [TypeOrmModule.forFeature([SkillCategory, Skill])],
  providers: [SkillCategoryService],
  controllers: [SkillCategoryController],
  exports: [SkillCategoryService],
})
export class SkillCategoryModule {}
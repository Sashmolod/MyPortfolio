import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { Skill } from '../admin/entities/skill.entity';
import { Project } from '../admin/entities/project.entity';
import { ContactMessage } from '../admin/entities/contact-message.entity';
import { Hero } from '../admin/entities/hero.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill, Project, ContactMessage, Hero]),
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
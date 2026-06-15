import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioController } from './portfolio.controller';
import { ConfigController } from './config.controller';
import { PortfolioService } from './portfolio.service';
import { Skill, SkillCategory, Project, ContactMessage, Hero, SocialLink, Settings } from '../shared/entities';
import { StatsModule } from '../stats/stats.module';
import { CaptchaService } from './services/captcha.service';
import { GeminiService } from './services/gemini.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Skill, SkillCategory, Project, ContactMessage, Hero, SocialLink, Settings]),
    StatsModule,
  ],
  controllers: [PortfolioController, ConfigController],
  providers: [PortfolioService, CaptchaService, GeminiService],
  exports: [PortfolioService, CaptchaService, GeminiService],
})
export class PortfolioModule {}
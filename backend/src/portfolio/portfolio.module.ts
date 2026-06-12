import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioController } from './portfolio.controller';
import { ConfigController } from './config.controller';
import { PortfolioService } from './portfolio.service';
import { Skill } from '../admin/entities/skill.entity';
import { SkillCategory } from '../admin/entities/skill-category.entity';
import { Project } from '../admin/entities/project.entity';
import { ContactMessage } from '../admin/entities/contact-message.entity';
import { Hero } from '../admin/entities/hero.entity';
import { SocialLink } from '../admin/entities/social-link.entity';
import { Settings } from '../admin/entities/settings.entity';
import { StatsModule } from '../stats/stats.module';
import { StatsService } from '../stats/stats.service';

const statsEnabled = process.env.ENABLE_STATS_MODULE !== 'false';

const imports = [
  TypeOrmModule.forFeature([Skill, SkillCategory, Project, ContactMessage, Hero, SocialLink, Settings]),
];

const providers: any[] = [PortfolioService];

if (statsEnabled) {
  imports.push(StatsModule);
} else {
  providers.push({
    provide: StatsService,
    useValue: {
      recordVisit: async () => {},
      incrementProjectView: async () => {},
      recordVisitFromRequest: async () => {},
    },
  });
}

@Module({
  imports,
  controllers: [PortfolioController, ConfigController],
  providers,
  exports: [PortfolioService],
})
export class PortfolioModule {}
import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { VisitStat } from '../admin/entities/visit-stat.entity';
import { Project } from '../admin/entities/project.entity';
import { StatsMiddleware } from './stats.middleware';

@Module({
  imports: [TypeOrmModule.forFeature([VisitStat, Project])],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(StatsMiddleware)
      .exclude(
        { path: 'uploads/(.*)', method: RequestMethod.ALL },
        { path: 'docs', method: RequestMethod.ALL },
        { path: 'docs/(.*)', method: RequestMethod.ALL },
        { path: 'api/admin/(.*)', method: RequestMethod.ALL },
        { path: 'api/auth/(.*)', method: RequestMethod.ALL },
        { path: 'api/health', method: RequestMethod.ALL },
        { path: 'api/portfolio/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
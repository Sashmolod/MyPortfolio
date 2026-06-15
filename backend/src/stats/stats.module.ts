import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { VisitStat, Project, AuditLog } from '../shared/entities';
import { StatsMiddleware } from './stats.middleware';
import { StatsEnabledGuard } from './stats-enabled.guard';

@Module({
  imports: [TypeOrmModule.forFeature([VisitStat, Project, AuditLog])],
  controllers: [StatsController],
  providers: [StatsService, StatsEnabledGuard],
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
        { path: 'api/(.*)', method: RequestMethod.ALL },
      )
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
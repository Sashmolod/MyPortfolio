import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
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
      .forRoutes('*');
  }
}
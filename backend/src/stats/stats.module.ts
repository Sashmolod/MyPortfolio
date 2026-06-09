import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { VisitStat } from '../admin/entities/visit-stat.entity';
import { Project } from '../admin/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([VisitStat, Project])],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
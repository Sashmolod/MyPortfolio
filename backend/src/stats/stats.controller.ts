import {
  Controller,
  Get,
  Query,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { GetStatsDto } from './dto/stats.dto';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';

@ApiTags('stats')
@Controller('stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatsController {
  private readonly logger = new Logger(StatsController.name);

  constructor(private readonly statsService: StatsService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Получить общую статистику' })
  async getOverview() {
    try {
      const overview = await this.statsService.getOverview();
      return {
        statusCode: HttpStatus.OK,
        data: overview,
      };
    } catch (error: any) {
      this.logger.error(`Failed to get overview: ${error.message}`, error.stack);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка при получении статистики',
      };
    }
  }

  @Get('visits')
  @ApiOperation({ summary: 'Получить список визитов' })
  async getVisits(@Query() dto: GetStatsDto) {
    try {
      const page = dto.page || 1;
      const limit = dto.limit || 50;
      const filters = {
        path: dto.path,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      };

      const result = await this.statsService.getVisits(page, limit, filters);

      return {
        statusCode: HttpStatus.OK,
        data: result.visits,
        meta: {
          total: result.total,
          page,
          limit,
          totalPages: Math.ceil(result.total / limit),
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to get visits: ${error.message}`, error.stack);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка при получении визитов',
      };
    }
  }

  @Get('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Очистить старые визиты' })
  async cleanupOldVisits(@Query('days') days?: string) {
    try {
      const daysToKeep = days ? parseInt(days, 10) : 365;
      const deleted = await this.statsService.cleanupOldVisits(daysToKeep);

      return {
        statusCode: HttpStatus.OK,
        message: `Очищено ${deleted} записей`,
      };
    } catch (error: any) {
      this.logger.error(`Failed to cleanup: ${error.message}`, error.stack);
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка при очистке данных',
      };
    }
  }
}
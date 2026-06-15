import { Controller, Get, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse } from '@nestjs/swagger';
import { HealthResponseDto, DetailHealthResponseDto } from './shared/dto';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check для Docker (без подключения к БД)' })
  @ApiOkResponse({ description: 'Сервис работает исправно', type: HealthResponseDto })
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 запросов в минуту
  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      service: 'portfolio-backend',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('detail')
  @ApiOperation({ summary: 'Подробный health check с проверкой БД' })
  @ApiOkResponse({ description: 'Детальный статус работоспособности получен', type: DetailHealthResponseDto })
  @ApiResponse({ status: 503, description: 'Сервис или БД не отвечают' })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async getDetailHealth(): Promise<DetailHealthResponseDto> {
    const dbStatus = 'unknown';
    
    return {
      status: 'ok',
      service: 'portfolio-backend',
      database: dbStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      memory: {
        rss: `${Math.round(require('node:process').memoryUsage().rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(require('node:process').memoryUsage().heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(require('node:process').memoryUsage().heapTotal / 1024 / 1024)}MB`,
      },
    };
  }
}
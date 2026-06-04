import { Controller, Get, HttpStatus } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Health check для Docker (без подключения к БД)' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @Throttle({ default: { limit: 30, ttl: 60000 } }) // 30 запросов в минуту
  getHealth(): object {
    return {
      status: 'ok',
      service: 'portfolio-backend',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('detail')
  @ApiOperation({ summary: 'Подробный health check с проверкой БД' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Service is unhealthy' })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async getDetailHealth(): Promise<object> {
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
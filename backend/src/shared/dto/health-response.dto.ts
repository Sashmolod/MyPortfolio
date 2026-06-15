import { ApiProperty } from '@nestjs/swagger';

export class HealthResponseDto {
  @ApiProperty({ description: 'Статус работоспособности сервиса', example: 'ok' })
  status: string;

  @ApiProperty({ description: 'Название сервиса', example: 'portfolio-backend' })
  service: string;

  @ApiProperty({ description: 'Текущее время сервера в ISO формате', example: '2026-06-07T01:39:27.000Z' })
  timestamp: string;
}

class MemoryStatsDto {
  @ApiProperty({ description: 'Resident Set Size (полный объем памяти процесса)', example: '85MB' })
  rss: string;

  @ApiProperty({ description: 'Объем используемой памяти в куче (heap)', example: '45MB' })
  heapUsed: string;

  @ApiProperty({ description: 'Общий размер выделенной кучи', example: '60MB' })
  heapTotal: string;
}

export class DetailHealthResponseDto extends HealthResponseDto {
  @ApiProperty({ description: 'Статус подключения к базе данных', example: 'ok' })
  database: string;

  @ApiProperty({ description: 'Время работы приложения (uptime) в секундах', example: 120.5 })
  uptime: number;

  @ApiProperty({ description: 'Статистика использования оперативной памяти', type: MemoryStatsDto })
  memory: MemoryStatsDto;
}

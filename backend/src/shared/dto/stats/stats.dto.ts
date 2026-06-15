import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, IsString, IsDateString } from 'class-validator';

export class GetStatsDto {
  @ApiPropertyOptional({ description: 'Номер страницы', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page?: number = 1;

  @ApiPropertyOptional({ description: 'Количество записей на странице', example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly limit?: number = 50;

  @ApiPropertyOptional({ description: 'Фильтр по URL странице', example: '/' })
  @IsOptional()
  @IsString()
  readonly path?: string;

  @ApiPropertyOptional({ description: 'Дата начала (ISO 8601)', example: '2026-06-01' })
  @IsOptional()
  @IsDateString()
  readonly startDate?: string;

  @ApiPropertyOptional({ description: 'Дата окончания (ISO 8601)', example: '2026-06-30' })
  @IsOptional()
  @IsDateString()
  readonly endDate?: string;
}
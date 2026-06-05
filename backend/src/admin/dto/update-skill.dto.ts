import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateSkillDto } from './create-skill.dto';
import { Transform } from 'class-transformer';

export class UpdateSkillDto implements Partial<CreateSkillDto> {
  @ApiPropertyOptional({ description: 'Skill name', example: 'JavaScript' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Icon class or emoji', example: 'react' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: 'Skill description', example: 'Advanced level development' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Proficiency level (0-100)', example: 90 })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '') return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : Math.min(100, Math.max(0, num));
  })
  level?: number;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '') return undefined;
    return Number(value);
  })
  sortOrder?: number;
}
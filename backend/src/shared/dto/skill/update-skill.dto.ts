import { IsString, IsNumber, IsOptional, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateSkillDto {
  @ApiPropertyOptional({ description: 'Skill name', example: 'JavaScript' })
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Icon class or emoji', example: 'react' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  icon?: string;

  @ApiPropertyOptional({ description: 'Skill description', example: 'Advanced level development' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
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

  @ApiPropertyOptional({ description: 'Category ID (FK to skill_category)', example: 1, nullable: true })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '') return undefined;
    if (value === null) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  })
  categoryId?: number | null;

  @ApiPropertyOptional({ description: 'Subcategory ID (FK to skill_category)', example: 2, nullable: true })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '') return undefined;
    if (value === null) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  })
  subcategoryId?: number | null;
}
import { IsString, IsNumber, IsOptional, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateSkillDto {
  @ApiProperty({ description: 'Skill name', example: 'JavaScript' })
  @IsString()
  @IsNotEmpty()
  name: string;

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
    if (value === undefined || value === '') return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : Math.min(100, Math.max(0, num));
  })
  level?: number;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '') return 0;
    return Number(value);
  })
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Category ID (FK to skill_category)', example: 1, nullable: true })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '' || value === null) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  })
  categoryId?: number | null;

  @ApiPropertyOptional({ description: 'Subcategory ID (FK to skill_category)', example: 2, nullable: true })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '' || value === null) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  })
  subcategoryId?: number | null;
}
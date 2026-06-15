import { IsString, IsOptional, IsInt, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateSkillCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'Frontend' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ description: 'Parent category ID', example: 1, nullable: true })
  @IsOptional()
  @IsInt()
  parentId?: number | null;

  @ApiPropertyOptional({ description: 'Display sort order', example: 1 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => {
    if (value === undefined || value === '') return 0;
    return Number(value);
  })
  sortOrder?: number;
}

import { IsString, IsNumber, IsOptional, IsNotEmpty, IsArray, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateProjectDto {
  @ApiProperty({ description: 'Project title', example: 'My Portfolio Website' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  title: string;

  @ApiPropertyOptional({ description: 'Project description', example: 'A modern portfolio built with React and NestJS' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ description: 'Image URL', example: '/images/project1.png' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  image?: string;

  @ApiPropertyOptional({ description: 'Project link URL', example: 'https://example.com' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  link?: string;

  @ApiPropertyOptional({ description: 'Skill IDs associated with the project', example: [1, 2, 3] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  skillIds?: number[];

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '') return 0;
    return Number(value);
  })
  sortOrder?: number;
}
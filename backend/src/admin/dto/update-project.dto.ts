import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto implements Partial<CreateProjectDto> {
  @ApiPropertyOptional({ description: 'Project title', example: 'My Portfolio Website' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Project description', example: 'A modern portfolio built with React and NestJS' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Image URL', example: '/images/project1.png' })
  @IsString()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({ description: 'Project link URL', example: 'https://example.com' })
  @IsString()
  @IsOptional()
  link?: string;

  @ApiPropertyOptional({ description: 'Technologies used (comma-separated)', example: 'React, NestJS, SQLite' })
  @IsString()
  @IsOptional()
  technologies?: string;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}
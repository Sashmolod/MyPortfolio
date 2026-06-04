import { IsString, IsNumber, IsOptional, IsNotEmpty, IsEmail, Min, Max } from 'class-validator';
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
}

export class CreateProjectDto {
  @ApiProperty({ description: 'Project title', example: 'My Portfolio Website' })
  @IsString()
  @IsNotEmpty()
  title: string;

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
  @Transform(({ value }) => {
    if (value === undefined || value === '') return 0;
    return Number(value);
  })
  sortOrder?: number;
}

export class CreateContactMessageDto {
  @ApiProperty({ description: 'Sender name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Sender email', example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Message subject', example: 'Collaboration request' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ description: 'Message content', example: 'I would like to discuss a potential project...' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class CreateHeroDto {
  @ApiProperty({ description: 'Name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Title', example: 'Full Stack Developer' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'Bio', example: 'Passionate developer' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ description: 'Avatar URL', example: '/favicon.svg' })
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ description: 'Social links JSON', example: { github: 'https://github.com', linkedin: 'https://linkedin.com' } })
  @IsOptional()
  socialLinks?: Record<string, string>;
}

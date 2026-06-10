import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiPropertyOptional({ description: 'Social links JSON string', example: '{"github":"https://github.com","linkedin":"https://linkedin.com"}' })
  @IsString()
  @IsOptional()
  socialLinks?: string;

  @ApiPropertyOptional({ description: 'Is this the primary hero (defaults to true, only one can be true)', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

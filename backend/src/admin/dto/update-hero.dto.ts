import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateHeroDto } from './create-hero.dto';

export class UpdateHeroDto implements Partial<CreateHeroDto> {
  @ApiPropertyOptional({ description: 'Name', example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Title', example: 'Full Stack Developer' })
  @IsString()
  @IsOptional()
  title?: string;

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

  @ApiPropertyOptional({ description: 'Is this the primary hero (only one can be true)', example: true })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

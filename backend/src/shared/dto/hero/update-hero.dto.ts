import { IsString, IsOptional, IsBoolean, MinLength, MaxLength, IsJSON } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateHeroDto } from './create-hero.dto';

export class UpdateHeroDto implements Partial<CreateHeroDto> {
  @ApiPropertyOptional({ description: 'Name', example: 'John Doe' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Title', example: 'Full Stack Developer' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  title?: string;

  @ApiPropertyOptional({ description: 'Bio', example: 'Passionate developer' })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({ description: 'Avatar URL', example: '/favicon.svg' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  avatar?: string;

  @ApiPropertyOptional({ description: 'Social links JSON string', example: '{"github":"https://github.com","linkedin":"https://linkedin.com"}' })
  @IsString()
  @IsJSON()
  @IsOptional()
  @MaxLength(1000)
  socialLinks?: string;

  @ApiPropertyOptional({ description: 'Is this the primary hero (only one can be true)', example: true })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

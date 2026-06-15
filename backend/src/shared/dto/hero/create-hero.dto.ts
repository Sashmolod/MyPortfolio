import { IsString, IsNotEmpty, IsOptional, IsBoolean, MinLength, MaxLength, IsJSON } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHeroDto {
  @ApiProperty({ description: 'Name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Title', example: 'Full Stack Developer' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  title: string;

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

  @ApiPropertyOptional({ description: 'Is this the primary hero (defaults to true, only one can be true)', example: true, default: true })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

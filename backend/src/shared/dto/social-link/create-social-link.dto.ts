import { IsString, IsNumber, IsOptional, IsNotEmpty, IsUrl, MinLength, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateSocialLinkDto {
  @ApiProperty({ description: 'Platform name', example: 'GitHub' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  platform: string;

  @ApiProperty({ description: 'URL profile link', example: 'https://github.com/yourusername' })
  @IsUrl()
  @IsNotEmpty()
  @MaxLength(500)
  url: string;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '') return 0;
    return Number(value);
  })
  sortOrder?: number;
}

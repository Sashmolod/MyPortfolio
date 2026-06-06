import { IsString, IsNumber, IsOptional, IsNotEmpty, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class CreateSocialLinkDto {
  @ApiProperty({ description: 'Platform name', example: 'GitHub' })
  @IsString()
  @IsNotEmpty()
  platform: string;

  @ApiProperty({ description: 'URL profile link', example: 'https://github.com/yourusername' })
  @IsString()
  @IsNotEmpty()
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

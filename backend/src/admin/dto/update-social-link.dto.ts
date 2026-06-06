import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { CreateSocialLinkDto } from './create-social-link.dto';

export class UpdateSocialLinkDto implements Partial<CreateSocialLinkDto> {
  @ApiPropertyOptional({ description: 'Platform name', example: 'GitHub' })
  @IsString()
  @IsOptional()
  platform?: string;

  @ApiPropertyOptional({ description: 'URL profile link', example: 'https://github.com/yourusername' })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional({ description: 'Display order', example: 1 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === '') return undefined;
    return Number(value);
  })
  sortOrder?: number;
}

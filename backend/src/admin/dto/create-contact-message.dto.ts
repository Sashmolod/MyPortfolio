import { IsString, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

  @ApiPropertyOptional({ description: 'Honeypot field (must be left empty by humans)', example: '' })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiPropertyOptional({ description: 'User answer to mathematical captcha', example: '12' })
  @IsString()
  @IsOptional()
  captchaAnswer?: string;

  @ApiPropertyOptional({ description: 'Cryptographic captcha token signed by server', example: '1780900000000:abc...' })
  @IsString()
  @IsOptional()
  captchaToken?: string;
}
import { IsString, IsEmail, IsNotEmpty, IsOptional, MinLength, MaxLength, IsNumberString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateContactMessageDto {
  @ApiProperty({ description: 'Sender name', example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Sender email', example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  email: string;

  @ApiProperty({ description: 'Message subject', example: 'Collaboration request' })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  subject: string;

  @ApiProperty({ description: 'Message content', example: 'I would like to discuss a potential project...' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({ description: 'Honeypot field (must be left empty by humans)', example: '' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  nickname?: string;

  @ApiProperty({ description: 'User answer to mathematical captcha', example: '12' })
  @IsString()
  @IsNotEmpty({ message: 'Captcha answer is required' })
  @IsNumberString({}, { message: 'Captcha answer must be a number' })
  captchaAnswer: string;

  @ApiProperty({ description: 'Cryptographic captcha token signed by server', example: '1780900000000:abc...' })
  @IsString()
  @IsNotEmpty({ message: 'Captcha token is required' })
  captchaToken: string;
}
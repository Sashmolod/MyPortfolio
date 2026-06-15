import { IsString, IsEmail, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateContactMessageDto } from './create-contact-message.dto';

export class UpdateContactMessageDto implements Partial<CreateContactMessageDto> {
  @ApiPropertyOptional({ description: 'Sender name', example: 'John Doe' })
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ description: 'Sender email', example: 'john@example.com' })
  @IsEmail()
  @IsOptional()
  @MaxLength(100)
  email?: string;

  @ApiPropertyOptional({ description: 'Message subject', example: 'Collaboration request' })
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(150)
  subject?: string;

  @ApiPropertyOptional({ description: 'Message content', example: 'I would like to discuss a potential project...' })
  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(2000)
  message?: string;
}
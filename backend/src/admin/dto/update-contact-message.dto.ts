import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateContactMessageDto } from './create-contact-message.dto';

export class UpdateContactMessageDto implements Partial<CreateContactMessageDto> {
  @ApiPropertyOptional({ description: 'Sender name', example: 'John Doe' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Sender email', example: 'john@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Message subject', example: 'Collaboration request' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiPropertyOptional({ description: 'Message content', example: 'I would like to discuss a potential project...' })
  @IsString()
  @IsOptional()
  message?: string;
}
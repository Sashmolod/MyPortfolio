import { IsString, MinLength, MaxLength, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChangePasswordDto {
  @ApiProperty({ description: 'Current password', example: 'admin123' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  currentPassword: string;

  @ApiProperty({ description: 'New password (min 8 characters, must contain uppercase, lowercase, numbers, and special characters)', example: 'newSecurePass123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Пароль должен содержать минимум 8 символов, включая заглавную букву, строчную букву, число или специальный символ',
  })
  newPassword: string;
}
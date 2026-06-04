import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Admin username', example: 'admin' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: 'Admin password (min 6 characters)', example: 'admin123' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;
}

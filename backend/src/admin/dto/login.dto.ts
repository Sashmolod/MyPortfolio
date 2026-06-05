import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Admin username', example: 'admin' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ description: 'Admin password (min 5 characters)', example: 'admin' })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  password: string;
}

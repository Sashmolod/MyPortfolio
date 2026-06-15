import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Admin username', example: 'admin' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  username: string;

  @ApiProperty({ description: 'Admin password (min 5 characters)', example: 'admin' })
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  password: string;
}

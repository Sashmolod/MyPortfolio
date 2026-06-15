import { ApiProperty } from '@nestjs/swagger';

class UserResponseDto {
  @ApiProperty({ description: 'ID пользователя', example: 1 })
  id: number;

  @ApiProperty({ description: 'Имя пользователя', example: 'admin' })
  username: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'Сообщение об успешном входе', example: 'Успешный вход' })
  message: string;

  @ApiProperty({ description: 'Данные пользователя', type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ description: 'Access JWT токен (также устанавливается в HttpOnly cookie)', example: 'eyJhbGciOiJIUz...' })
  accessToken: string;

  @ApiProperty({ description: 'Refresh JWT токен (также устанавливается в HttpOnly cookie)', example: 'eyJhbGciOiJIUz...' })
  refreshToken: string;

  @ApiProperty({ description: 'Время истечения access токена в секундах', example: 3600 })
  expiresIn: number;
}

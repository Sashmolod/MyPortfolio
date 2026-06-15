import { ApiProperty } from '@nestjs/swagger';

export class RefreshResponseDto {
  @ApiProperty({ description: 'Сообщение об обновлении токенов', example: 'Токены обновлены' })
  message: string;

  @ApiProperty({ description: 'Новый Access JWT токен', example: 'eyJhbGciOiJIUz...' })
  accessToken: string;

  @ApiProperty({ description: 'Новый Refresh JWT токен', example: 'eyJhbGciOiJIUz...' })
  refreshToken: string;

  @ApiProperty({ description: 'Время жизни access токена в секундах', example: 3600 })
  expiresIn: number;
}

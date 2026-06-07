import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({ description: 'Сообщение о выходе из системы', example: 'Вы вышли из системы' })
  message: string;
}

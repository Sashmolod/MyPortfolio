import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({ description: 'Сообщение о результате операции', example: 'Операция выполнена успешно' })
  message: string;
}

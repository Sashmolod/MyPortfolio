import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminResponseDto {
  @ApiProperty({ description: 'Сообщение о результате создания администратора', example: 'Администратор успешно создан' })
  message: string;

  @ApiProperty({ description: 'Флаг, указывающий, существовал ли администратор ранее', example: false })
  isExisting: boolean;
}

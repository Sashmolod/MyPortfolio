import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../../shared/entities';

export class MeResponseDto {
  @ApiProperty({ description: 'Данные текущего авторизованного администратора', type: User })
  user: User;
}

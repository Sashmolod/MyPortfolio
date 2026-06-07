import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class MeResponseDto {
  @ApiProperty({ description: 'Данные текущего авторизованного администратора', type: User })
  user: User;
}

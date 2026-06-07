import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ContactInfoDto {
  @ApiProperty({ description: 'Контактный email', example: 'john@example.com' })
  email: string;

  @ApiProperty({ description: 'Контактный телефон', example: '+1 234 567 890' })
  phone: string;

  @ApiProperty({ description: 'Контактный адрес / местоположение', example: 'Kyiv, Ukraine' })
  address: string;
}

export class DoodlyChatRequestDto {
  @ApiProperty({ description: 'Текст сообщения для Doodly AI', example: 'Привет! Расскажи анекдот.' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class DoodlyChatResponseDto {
  @ApiProperty({ description: 'Ответ от Doodly AI', example: 'Я просто скрепка на бумаге, но готов помочь! 📎' })
  response: string;
}

export class DoodlyGuessRequestDto {
  @ApiProperty({ description: 'Изображение в формате Base64 Data URL с холста рисования', example: 'data:image/png;base64,iVBORw0KGgo...' })
  @IsString()
  @IsNotEmpty()
  image: string;
}

export class DoodlyGuessResponseDto {
  @ApiProperty({ description: 'Предположение Doodly AI о том, что нарисовано', example: 'Кажется, это улыбающееся лицо или солнце! ☀️' })
  guess: string;
}

export class HeroSocialLinkDto {
  @ApiProperty({ description: 'Название платформы', example: 'GitHub' })
  platform: string;

  @ApiProperty({ description: 'URL-ссылка на профиль', example: 'https://github.com/username' })
  url: string;
}

export class HeroDataDto {
  @ApiProperty({ description: 'ID профиля (может отсутствовать для дефолтных данных)', example: 1, required: false })
  id?: number;

  @ApiProperty({ description: 'Имя', example: 'Александр' })
  name: string;

  @ApiProperty({ description: 'Заголовок / Роль', example: 'Fullstack Developer' })
  title: string;

  @ApiProperty({ description: 'Описание био', example: 'Я создаю веб-приложения...' })
  bio: string;

  @ApiProperty({ description: 'Аватар (путь к изображению или null)', example: '/uploads/avatar.png', nullable: true })
  avatar: string | null;

  @ApiProperty({ description: 'Список социальных ссылок', type: [HeroSocialLinkDto] })
  socialLinks: HeroSocialLinkDto[];
}

export class CaptchaResponseDto {
  @ApiProperty({ description: 'Математический вопрос для решения (например, "5 + 3 = ?")', example: '5 + 3 = ?' })
  question: string;

  @ApiProperty({ description: 'Подписанный токен капчи, содержащий время действия и ответ', example: '1780900000000:abc123xyz...' })
  token: string;
}

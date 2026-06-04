import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

/**
 * Сериализованные данные пользователя (без пароля)
 */
export interface AuthPayload {
  accessToken: string;
  user: {
    id: number;
    username: string;
    isActive: boolean;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Логин администратора.
   * Проверяет credentials, генерирует JWT и возвращает payload.
   */
  async login(dto: LoginDto): Promise<AuthPayload> {
    // 1. Находим пользователя по username (с паролем)
    const user = await this.userService.findByUsername(dto.username);

    if (!user) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    // 2. Валидируем пароль через bcrypt
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    // 3. Неактивный пользователь?
    if (!user.isActive) {
      throw new UnauthorizedException('Аккаунт деактивирован');
    }

    // 4. Генерируем JWT токен (expires: 1 день)
    const payload = { sub: user.id, username: user.username };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: '1d',
    });

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        isActive: user.isActive,
      },
    };
  }

  /**
   * Получить данные текущего пользователя по ID (из сессии/guard)
   */
  async getCurrentUser(userId: number) {
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    return {
      id: user.id,
      username: user.username,
      isActive: user.isActive,
      createdAt: user.createdAt,
    };
  }

  /**
   * Смена пароля текущего пользователя
   */
  async changePassword(userId: number, dto: ChangePasswordDto): Promise<{ message: string }> {
    // findById не возвращает password, поэтому берём напрямую через query builder
    const user = await this.userService.usersRepository.findOne({
      where: { id: userId },
      select: ['id', 'username', 'password', 'isActive'],
    });

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    // Проверяем текущий пароль
    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Текущий пароль неверный');
    }

    // Хешируем новый пароль
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(dto.newPassword, saltRounds);

    // Обновляем пароль
    await this.userService.update(userId, { password: hashedPassword });

    return {
      message: 'Пароль успешно изменён',
    };
  }

  /**
   * Создание первого администратора (seed)
   */
  async createDefaultAdmin(dto: LoginDto): Promise<{ message: string; isExisting: boolean }> {
    const existing = await this.userService.findByUsername(dto.username);

    if (existing && existing.password) {
      throw new ConflictException('Администратор уже существует');
    }

    // Хэшируем пароль
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    await this.userService.createDefaultAdmin({
      username: dto.username,
      password: hashedPassword,
    });

    return {
      message: 'Администратор успешно создан',
      isExisting: false,
    };
  }
}
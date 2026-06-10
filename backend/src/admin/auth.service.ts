import { Injectable, UnauthorizedException, ConflictException, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { UserService } from './user.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Repository, LessThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtBlacklist } from './entities/jwt-blacklist.entity';

/**
 * Сериализованные данные пользователя (без пароля)
 */
export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: {
    id: number;
    username: string;
    isActive: boolean;
  };
}

@Injectable()
export class AuthService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(AuthService.name);
  private pruneIntervalId: NodeJS.Timeout | null = null;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(JwtBlacklist)
    private readonly blacklistRepository: Repository<JwtBlacklist>,
  ) {}

  onApplicationBootstrap() {
    // Проводим очистку сразу при запуске
    this.pruneBlacklist();

    // Запускаем периодическую очистку каждые 12 часов
    this.pruneIntervalId = setInterval(() => {
      this.pruneBlacklist();
    }, 12 * 60 * 60 * 1000);
  }

  onModuleDestroy() {
    // Очищаем интервал при остановке приложения для избежания утечек и зависания тестов
    if (this.pruneIntervalId) {
      clearInterval(this.pruneIntervalId);
    }
  }

  /**
   * Очистка просроченных токенов из черного списка
   */
  async pruneBlacklist(): Promise<void> {
    try {
      const result = await this.blacklistRepository.delete({
        expiresAt: LessThan(new Date()),
      });
      this.logger.log(`Успешно удалено устаревших токенов из черного списка: ${result.affected || 0}`);
    } catch (error: any) {
      this.logger.error(`Ошибка при очистке черного списка токенов: ${error?.message || error}`);
    }
  }

  /**
   * Логин администратора.
   * Проверяет credentials, генерирует JWT и возвращает payload.
   */
  async login(dto: LoginDto): Promise<AuthPayload> {
    // 1. Находим пользователя по username (с паролем)
    const user = await this.userService.findByUsername(dto.username);

    if (!user) {
      this.logger.warn(`Попытка входа с несуществующим логином: ${dto.username}`);
      // Предотвращение тайминг-атак (timing attacks)
      await bcrypt.compare(dto.password, '$2a$10$abcdefghijklmnopqrstuv');
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    // 2. Проверяем блокировку аккаунта
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      this.logger.warn(`Попытка входа в заблокированный аккаунт: ${dto.username}`);
      throw new UnauthorizedException('Аккаунт временно заблокирован. Попробуйте позже.');
    }

    // 3. Валидируем пароль через bcrypt
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      await this.userService.incrementLoginAttempts(user);
      const attempts = (user.loginAttempts || 0) + 1;
      this.logger.warn(`Неверный пароль для пользователя: ${dto.username}. Попытка ${attempts}/5`);
      
      if (attempts >= 5) {
        throw new UnauthorizedException('Неверный логин или пароль. Аккаунт заблокирован на 15 минут.');
      } else {
        throw new UnauthorizedException('Неверный логин или пароль');
      }
    }

    // 4. Неактивный пользователь?
    if (!user.isActive) {
      this.logger.warn(`Попытка входа в неактивный аккаунт: ${dto.username}`);
      throw new UnauthorizedException('Неверный логин или пароль');
    }

    // Сбрасываем попытки входа при успешной аутентификации
    if (user.loginAttempts > 0 || user.lockoutUntil) {
      await this.userService.resetLoginAttempts(user.id);
    }

    // 4. Генерируем access token (короткоживущий)
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured inside env');
    }

    const accessPayload = { sub: user.id, username: user.username, type: 'access' };
    const accessToken = this.jwtService.sign(accessPayload, {
      secret,
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '1h',
      jwtid: `acc_${user.id}_${randomUUID()}`, // jti для access token
    });

    // 5. Генерируем refresh token (долгосрочный)
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || secret;
    const refreshPayload = { sub: user.id, username: user.username, type: 'refresh' };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: refreshSecret,
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      jwtid: `ref_${user.id}_${randomUUID()}`, // jti для refresh token
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600, // 1 час
      user: {
        id: user.id,
        username: user.username,
        isActive: user.isActive,
      },
    };
  }

  /**
   * Обновление токенов через refresh token
   */
  async refreshTokens(refreshToken: string): Promise<AuthPayload> {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      if (!secret) {
        throw new Error('JWT_SECRET is not configured');
      }
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || secret;

      // Проверяем refresh token
      const decoded = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });

      // Проверяем что это именно refresh token
      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Неверный тип токена');
      }

      // Проверяем по чёрному списку (logout)
      if (decoded.jti) {
        const isBlacklisted = await this.isBlacklisted(decoded.jti);
        if (isBlacklisted) {
          this.logger.warn(`Попытка использовать отозванный refresh токен (blacklist), jti: ${decoded.jti}`);
          throw new UnauthorizedException('Токен недействителен (вышли из системы)');
        }
      }

      const userId = parseInt(decoded.sub, 10);
      if (!userId || isNaN(userId)) {
        throw new UnauthorizedException('Неверный пользователь в токене');
      }

      // Проверяем что пользователь существует и активен
      const user = await this.userService.findById(userId);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Пользователь не найден или деактивирован');
      }

      // Генерируем новые токены
      const accessPayload = { sub: user.id, username: user.username, type: 'access' };
      const accessToken = this.jwtService.sign(accessPayload, {
        secret,
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') || '1h',
      });

      const refreshPayload = { sub: user.id, username: user.username, type: 'refresh' };
      const newRefreshToken = this.jwtService.sign(refreshPayload, {
        secret: refreshSecret,
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') || '7d',
      });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        expiresIn: 3600,
        user: {
          id: user.id,
          username: user.username,
          isActive: user.isActive,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Неверный refresh токен');
    }
  }

  /**
   * Проверка находится ли токен в чёрном списке
   */
  async isBlacklisted(jti: string): Promise<boolean> {
    const entry = await this.blacklistRepository.findOne({
      where: { jti },
    });
    return !!entry;
  }

  /**
   * Добавление токена в чёрный список
   */
  private async blacklistToken(jti: string, expiresAt: Date): Promise<void> {
    // Добавляем новую запись
    const entry = this.blacklistRepository.create({
      jti,
      expiresAt,
    });
    await this.blacklistRepository.save(entry);
  }

  /**
   * Выход (инвалидация refresh token через blacklist)
   */
  async logout(userId: number, refreshToken: string): Promise<{ message: string }> {
    try {
      const secret = this.configService.get<string>('JWT_SECRET');
      const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET') || secret;

      // Расшифровываем refresh token чтобы получить jti
      const decoded = this.jwtService.verify(refreshToken, {
        secret: refreshSecret,
      });

      if (decoded?.jti) {
        await this.blacklistToken(decoded.jti, new Date(decoded?.exp ? decoded.exp * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000));
      }
    } catch (error) {
      // Если token невалиден — всё равно возвращаем успех
      // (токен мог истечь, но мы хотим чтобы logout был идемпотентным)
    }

    return { message: 'Вы успешно вышли из системы' };
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
    // Получаем пользователя вместе с паролем через инкапсулированный метод сервиса
    const user = await this.userService.findByIdWithPassword(userId);

    if (!user) {
      this.logger.error(`Попытка смены пароля для несуществующего пользователя ID: ${userId}`);
      throw new UnauthorizedException('Пользователь не найден');
    }

    // Проверяем текущий пароль
    const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Неверный текущий пароль при попытке смены пароля для пользователя: ${user.username}`);
      throw new UnauthorizedException('Текущий пароль неверный');
    }

    // Хешируем новый пароль
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(dto.newPassword, saltRounds);

    // Обновляем пароль
    await this.userService.update(userId, { password: hashedPassword });

    this.logger.log(`Пароль пользователя ${user.username} успешно изменён`);

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
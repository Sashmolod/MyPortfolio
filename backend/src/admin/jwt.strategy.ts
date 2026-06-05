import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Сначала читаем из HttpOnly cookie
        (request: any) => {
          const token = request?.cookies?.AccessToken;
          if (token) {
            this.logger.log(`JWT extracted from cookie: YES`);
          }
          return token;
        },
        // Затем из Authorization заголовка (Bearer token)
        (request: any) => {
          const authHeader = request?.headers?.authorization;
          if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            this.logger.log(`JWT extracted from Authorization header: YES`);
            return token;
          }
          return null;
        },
      ]),
      secretOrKey: configService.get<string>('JWT_SECRET'),
      ignoreExpiration: false,
    });
  }

  /**
   * Валидация payload из JWT токена.
   * Вызывается автоматически JwtAuthGuard при каждом защищённом запросе.
   */
  async validate(payload: any) {
    this.logger.log(`Validating payload: ${JSON.stringify(payload)}`);
    
    // Проверяем токен по чёрному списку (logout)
    if (payload.jti) {
      const isBlacklisted = await this.authService.isBlacklisted(payload.jti);
      if (isBlacklisted) {
        this.logger.warn(`Попытка использовать отозванный токен (blacklist), jti: ${payload.jti}`);
        throw new UnauthorizedException('Токен недействителен (вышли из системы)');
      }
    }

    const user = await this.userService.findById(payload.sub);

    if (!user || !user.isActive) {
      this.logger.error('Пользователь не найден или деактивирован');
      throw new UnauthorizedException('Пользователь не найден или деактивирован');
    }

    // Возвращаем только нужные поля (без пароля) — они станут req.user
    const result = {
      id: user.id,
      sub: payload.sub,  // Добавляем sub обратно чтобы getMe работал
      username: user.username,
      isActive: user.isActive,
    };
    this.logger.log(`User validated: ${JSON.stringify(result)}`);
    return result;
  }
}

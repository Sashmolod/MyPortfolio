import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from './user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        // Читаем JWT из HttpOnly cookie
        (request: any) => {
          const token = request?.cookies?.AccessToken;
          this.logger.log(`JWT extracted from cookie: ${token ? 'YES' : 'NO'}`);
          return token;
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

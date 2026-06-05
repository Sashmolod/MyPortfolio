import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  Logger,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService, AuthPayload } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  // Строгий rate limit: максимум 5 попыток за 1 минуту с IP
  @Throttle({ default: { limit: 5, ttl: 60000 }, short: { limit: 3, ttl: 1000 } })
   @ApiOperation({ summary: 'Логин администратора (возвращает JWT и устанавливает HttpOnly cookie)' })
   @ApiBody({ type: LoginDto })
   @ApiResponse({ status: 200, description: 'Успешный вход' })
   @ApiResponse({ status: 401, description: 'Неверный логин или пароль' })
   @ApiResponse({ status: 429, description: 'Слишком много запросов. Попробуйте позже.' })
   @HttpCode(HttpStatus.OK)
   @Post('login')
    async login(@Body() dto: LoginDto, @Req() req: Request, @Res() res: Response) {
      const result: AuthPayload = await this.authService.login(dto);
      this.logger.log(`Успешный вход пользователя: ${dto.username} с IP: ${req.ip}`);

     // Устанавливаем HttpOnly, Secure (в prod), SameSite=Lax cookie
     // path: '/api' — cookie отправляется только на API routes
     res.cookie('AccessToken', result.accessToken, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'lax' as const,
       maxAge: result.expiresIn * 1000, // из токена
       path: '/api',
     });

     // Refresh token cookie (долгосрочный)
     res.cookie('RefreshToken', result.refreshToken, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'lax' as const,
       maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
       path: '/api/auth',
     });

     return res.json({
        message: 'Успешный вход',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn,
      });
   }

   @UseGuards(JwtAuthGuard)
   @ApiBearerAuth()
   @ApiOperation({ summary: 'Логаут (очищает cookie и аннулирует токен)' })
   @ApiResponse({ status: 200, description: 'Успешный логаут' })
   @HttpCode(HttpStatus.OK)
   @Post('logout')
    async logout(@Req() req: Request, @Res() res: Response) {
      const userId = parseInt((req.user as { sub: string })?.sub, 10);
      const refreshToken = req.cookies?.RefreshToken;

      if (userId && refreshToken) {
        try {
          await this.authService.logout(userId, refreshToken);
        } catch (error) {
          this.logger.error(`Ошибка аннулирования токена при выходе: ${error.message}`);
        }
      }

      this.logger.log(`Логаут пользователя ID: ${userId} с IP: ${req.ip}`);
      res.cookie('AccessToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 0,
        path: '/api',
      });

      res.cookie('RefreshToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 0,
        path: '/api/auth',
      });

     return res.json({ message: 'Вы вышли из системы' });
    }

   @ApiOperation({ summary: 'Обновление токенов через refresh token' })
   @ApiResponse({ status: 200, description: 'Токены успешно обновлены' })
   @ApiResponse({ status: 401, description: 'Неверный refresh токен' })
   @HttpCode(HttpStatus.OK)
   @Post('refresh')
   async refresh(@Req() req: Request, @Res() res: Response) {
     const refreshToken = req.cookies?.RefreshToken;

     if (!refreshToken) {
       return res.status(401).json({ message: 'Refresh token отсутствует' });
     }

     const result: AuthPayload = await this.authService.refreshTokens(refreshToken);

     // Обновляем cookie
     res.cookie('AccessToken', result.accessToken, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'lax' as const,
       maxAge: result.expiresIn * 1000,
       path: '/api',
     });

     res.cookie('RefreshToken', result.refreshToken, {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       sameSite: 'lax' as const,
       maxAge: 7 * 24 * 60 * 60 * 1000,
       path: '/api/auth',
     });

     return res.json({
       message: 'Токены обновлены',
       accessToken: result.accessToken,
       refreshToken: result.refreshToken,
       expiresIn: result.expiresIn,
     });
   }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить данные текущего залогиненного администратора' })
  @ApiResponse({ status: 200, description: 'Данные текущего пользователя', type: Object })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get('me')
  async getMe(@Req() req: Request) {
    // userId берётся из JWT через JwtStrategy
    const userId = parseInt((req.user as { sub: string })?.sub, 10);

    if (!userId) {
      throw new Error('Пользователь не найден в токене');
    }

    const user = await this.authService.getCurrentUser(userId);

    return { user };
  }

  // Строгий rate limit: максимум 3 попытки за 5 минут
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  @ApiOperation({ summary: 'Создать первого администратора (только если нет ни одного в базе)' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 201, description: 'Администратор успешно создан' })
  @ApiResponse({ status: 409, description: 'Администратор уже существует' })
  @ApiResponse({ status: 429, description: 'Слишком много запросов. Попробуйте позже.' })
  @HttpCode(HttpStatus.CREATED)
  @Post('create-first-admin')
  async createFirstAdmin(@Body() dto: LoginDto) {
    const result = await this.authService.createDefaultAdmin(dto);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Сменить пароль текущего пользователя' })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({ status: 200, description: 'Пароль успешно изменён' })
  @ApiResponse({ status: 401, description: 'Неверный текущий пароль' })
  @HttpCode(HttpStatus.OK)
  @Post('change-password')
  async changePassword(@Req() req: Request, @Body() dto: ChangePasswordDto) {
    const userId = parseInt((req.user as { sub: string })?.sub, 10);

    if (!userId) {
      throw new Error('Пользователь не найден в токене');
    }

    const result = await this.authService.changePassword(userId, dto);
    return result;
  }
}

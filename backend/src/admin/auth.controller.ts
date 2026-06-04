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
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const result: AuthPayload = await this.authService.login(dto);

    // Устанавливаем HttpOnly, Secure (в prod), SameSite=Strict cookie
    res.cookie('AccessToken', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 24 * 60 * 60 * 1000, // 1 день
      path: '/',
    });

    return res.json({
       message: 'Успешный вход',
       user: result.user,
       accessToken: result.accessToken,
     });
  }

  @ApiOperation({ summary: 'Логаут (очищает cookie)' })
  @ApiResponse({ status: 200, description: 'Успешный логаут' })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Res() res: Response) {
    res.cookie('AccessToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 0,
      path: '/',
    });

    return res.json({ message: 'Вы вышли из системы' });
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Получить данные текущего залогиненного администратора' })
  @ApiResponse({ status: 200, description: 'Данные текущего пользователя', type: Object })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get('me')
  async getMe(@Req() req: Request) {
    // userId берётся из JWT через JwtStrategy
    const userId = (req.user as { sub: number })?.sub;

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
    const userId = (req.user as { sub: number })?.sub;

    if (!userId) {
      throw new Error('Пользователь не найден в токене');
    }

    const result = await this.authService.changePassword(userId, dto);
    return result;
  }
}

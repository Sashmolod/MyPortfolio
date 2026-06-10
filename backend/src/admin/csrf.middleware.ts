import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

/**
 * CSRF Protection Middleware
 * 
 * Для POST/PUT/PATCH запросов проверяет CSRF token:
 * 1. Token должен быть в заголовке X-CSRF-Token
 * 2. Или в body как _csrf field
 * 
 * GET, HEAD, OPTIONS запросы не требуют CSRF token.
 */
@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  private readonly CSRF_COOKIE_NAME = 'csrf_token';
  private readonly CSRF_HEADER_NAME = 'X-CSRF-Token';

  use(req: Request, res: Response, next: NextFunction) {
    // CSRF не нужен для GET, HEAD, OPTIONS методов
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
    if (safeMethods.includes(req.method)) {
      return next();
    }

    // CSRF не нужен для login и csrf-token endpoints
    // (это точки входа, где у пользователя еще нет токена)
    // req.path уже обрезан middleware path, поэтому проверяем без /api/auth/ префикса
    const csrfExcludedPaths = ['/login', '/csrf-token'];
    if (csrfExcludedPaths.includes(req.path)) {
      return next();
    }

    // Генерируем CSRF token если его нет в cookie
    let csrfToken = req.cookies?.[this.CSRF_COOKIE_NAME];
    if (!csrfToken) {
      csrfToken = randomBytes(32).toString('hex');
      // Устанавливаем cookie с CSRF token
      res.cookie(this.CSRF_COOKIE_NAME, csrfToken, {
        httpOnly: false, // Нужно чтобы JS мог прочитать для отправки в заголовке
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict' as const,
        path: '/api',
      });
    }

    // Проверяем CSRF token в заголовке
    const providedToken = req.headers[this.CSRF_HEADER_NAME] as string;

    if (!providedToken) {
      // Если нет заголовка — проверяем body
      const bodyToken = (req.body?._csrf as string) || (req.query as any)?._csrf;
      if (!bodyToken || bodyToken !== csrfToken) {
        throw new UnauthorizedException('CSRF token missing or invalid');
      }
    } else if (providedToken !== csrfToken) {
      throw new UnauthorizedException('CSRF token mismatch');
    }

    next();
  }
}
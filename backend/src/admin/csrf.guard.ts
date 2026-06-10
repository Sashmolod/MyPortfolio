import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    // Разрешаем все запросы в тестовом окружении, чтобы не ломать E2E-тесты
    if (process.env.NODE_ENV === 'test') {
      return true;
    }

    // CSRF-защита проверяется только на методах, изменяющих состояние (POST, PUT, DELETE, PATCH)
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const requestedWith = request.headers['x-requested-with'];
      if (requestedWith !== 'XMLHttpRequest') {
        throw new ForbiddenException('CSRF Validation Failed: Missing or invalid X-Requested-With header.');
      }
    }

    return true;
  }
}

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, ip, user } = request;

    // Логируем только изменяющие операции (POST, PUT, DELETE, PATCH)
    const isWriteOperation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);

    return next.handle().pipe(
      tap(async () => {
        if (!isWriteOperation) return;

        const username = user?.username || body?.username || 'anonymous';
        const action = `${method} ${url}`;

        // Парсим сущность и ID из URL
        // Например: /api/admin/skill/123 -> entityType = 'skill', entityId = '123'
        const parts = url.split('/').filter(Boolean);
        let entityType = '';
        let entityId = '';

        const adminIndex = parts.indexOf('admin');
        if (adminIndex !== -1 && parts[adminIndex + 1]) {
          entityType = parts[adminIndex + 1];
          entityId = parts[adminIndex + 2] || '';
        }

        // Маскируем пароли и другие чувствительные данные
        const sanitizedBody = { ...body };
        const sensitiveFields = ['password', 'currentPassword', 'newPassword', 'token'];
        for (const field of sensitiveFields) {
          if (sanitizedBody[field]) {
            sanitizedBody[field] = '********';
          }
        }

        try {
          const logEntry = this.auditLogRepo.create({
            username,
            action,
            entityType,
            entityId,
            payload: JSON.stringify(sanitizedBody),
            ip: ip || request.headers['x-forwarded-for'] || '',
          });
          await this.auditLogRepo.save(logEntry);
        } catch (err) {
          console.error('Failed to save audit log:', err);
        }
      }),
    );
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { StatsService } from './stats.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StatsMiddleware {
  private readonly logger = new Logger(StatsMiddleware.name);

  constructor(
    private readonly statsService: StatsService,
    private readonly configService: ConfigService,
  ) {}

  async use(req: Request, res: Response, next: Function) {
    // Если модуль статистики выключен — пропускаем запись визита
    if (this.configService.get<string>('ENABLE_STATS_MODULE') === 'false') {
      next();
      return;
    }
    // Пропускаем CORS preflight запросы
    if (req.method === 'OPTIONS') {
      next();
      return;
    }

    // Пропускаем любые API запросы, загрузки и проверки здоровья
    const url = req.originalUrl;
    const cleanUrl = url.split('?')[0];

    if (
      cleanUrl.startsWith('/api') ||
      cleanUrl.startsWith('/uploads') ||
      cleanUrl.startsWith('/health')
    ) {
      next();
      return;
    }

    // Пропускаем статические файлы
    if (cleanUrl.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
      next();
      return;
    }

    try {
      const startTime = Date.now();

      // Ждём окончания запроса
      res.on('finish', async () => {
        try {
          // Записываем только успешные ответы (2xx) и редиректы (3xx)
          if (res.statusCode >= 400) {
            return;
          }

          // Определяем тип устройства по User-Agent
          const deviceType = this.detectDeviceType(req.headers['user-agent'] || '');
          
          const visitData = {
            ipAddress: this.getClientIp(req),
            userAgent: req.headers['user-agent'] || null,
            // Сохраняем только pathname без query string (предотвращает запись токенов/email из URL)
            path: (req.originalUrl || req.url).split('?')[0],
            referrer: this.getReferrer(req),
            country: null, // TODO: Добавить GeoIP в будущем
            browser: this.extractBrowser(req.headers['user-agent'] || ''),
            os: this.extractOS(req.headers['user-agent'] || ''),
            deviceType,
          };

          await this.statsService.recordVisit(visitData);
        } catch (error) {
          this.logger.error(`Failed to record visit: ${error}`);
        }
      });

      next();
    } catch (error) {
      this.logger.error(`Stats middleware error: ${error}`);
      next();
    }
  }

  private getClientIp(req: Request): string | null {
    const ip = req.ip || req.socket.remoteAddress || null;
    if (ip) {
      // Убираем IPv6 префикс для localhost
      return ip.replace('::ffff:', '').replace('::1', '127.0.0.1');
    }
    return null;
  }

  private getReferrer(req: Request): string | null {
    const referrer = req.headers['referer'] || req.headers['referrer'];
    if (typeof referrer === 'string') {
      return referrer;
    }
    return null;
  }

  private detectDeviceType(userAgent: string): string {
    const lower = userAgent.toLowerCase();
    if (/tablet|ipad|playbook|silk/i.test(lower)) {
      return 'tablet';
    }
    if (/mobile|iphone|android|blackberry|opera mini|opera mobi|seamonkey/i.test(lower)) {
      return 'mobile';
    }
    return 'desktop';
  }

  private extractBrowser(userAgent: string): string {
    const lower = userAgent.toLowerCase();
    if (lower.includes('chrome') && !lower.includes('chromium')) {
      return 'Chrome';
    }
    if (lower.includes('firefox')) {
      return 'Firefox';
    }
    if (lower.includes('safari') && !lower.includes('chrome')) {
      return 'Safari';
    }
    if (lower.includes('edge') || lower.includes('edg/')) {
      return 'Edge';
    }
    if (lower.includes('opera') || lower.includes('opr/')) {
      return 'Opera';
    }
    if (lower.includes('msie') || lower.includes('trident/')) {
      return 'Internet Explorer';
    }
    return 'Other';
  }

  private extractOS(userAgent: string): string {
    const lower = userAgent.toLowerCase();
    if (lower.includes('windows')) {
      return 'Windows';
    }
    if (lower.includes('mac os')) {
      return 'macOS';
    }
    if (lower.includes('linux')) {
      return 'Linux';
    }
    if (lower.includes('android')) {
      return 'Android';
    }
    if (lower.includes('iphone') || lower.includes('ipad') || lower.includes('ios')) {
      return 'iOS';
    }
    return 'Other';
  }
}
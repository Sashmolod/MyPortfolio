import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThan } from 'typeorm';
import { VisitStat, Project, AuditLog } from '../shared/entities';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';

export interface StatsOverview {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
  thisWeekVisits: number;
  thisMonthVisits: number;
  topPages: { path: string; count: number }[];
  topCountries: { country: string; count: number }[];
  deviceBreakdown: { deviceType: string; count: number }[];
  browserBreakdown: { browser: string; count: number }[];
  dailyVisits: { date: string; count: number }[];
  projectViews: { id: number; title: string; viewCount: number }[];
}

export interface DailyVisit {
  date: string;
  count: number;
}

@Injectable()
export class StatsService implements OnModuleDestroy {
  private readonly logger = new Logger(StatsService.name);
  private visitBuffer: Partial<VisitStat>[] = [];
  private flushTimeout: NodeJS.Timeout | null = null;
  private readonly bufferLimit = 20;
  private readonly flushIntervalMs = 5000;

  constructor(
    @InjectRepository(VisitStat)
    private visitStatRepo: Repository<VisitStat>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(AuditLog)
    private auditLogRepo: Repository<AuditLog>,
    private configService: ConfigService,
  ) {}

  /**
   * Ежедневная очистка статистики и логов аудита старше 90 дней
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOldData() {
    this.logger.log('Starting daily cleanup of old statistics and audit logs...');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 90);

    try {
      // 1. Удаление логов посещений старше 90 дней
      const statsResult = await this.visitStatRepo
        .createQueryBuilder()
        .delete()
        .where('visitedAt < :cutoffDate', { cutoffDate })
        .execute();

      // 2. Удаление логов аудита старше 90 дней
      const logsResult = await this.auditLogRepo
        .createQueryBuilder()
        .delete()
        .where('timestamp < :cutoffDate', { cutoffDate })
        .execute();

      this.logger.log(
        `Cleanup finished. Removed ${statsResult.affected ?? 0} visit records and ${logsResult.affected ?? 0} audit logs older than 90 days.`,
      );
    } catch (error: any) {
      this.logger.error(`Cleanup task failed: ${error.message}`, error.stack);
    }
  }

  private isEnabled(): boolean {
    return this.configService.get<string>('ENABLE_STATS_MODULE') !== 'false';
  }

  async onModuleDestroy() {
    this.logger.log('Stats module is destroying. Flushing visits buffer...');
    await this.flushBuffer();
  }

  /**
   * Записать визит (буферизованная запись в БД)
   */
  async recordVisit(visitData: Partial<VisitStat>): Promise<void> {
    if (!this.isEnabled()) return;
    this.visitBuffer.push(visitData);

    if (this.visitBuffer.length >= this.bufferLimit) {
      await this.flushBuffer();
    } else if (!this.flushTimeout) {
      this.flushTimeout = setTimeout(() => {
        this.flushBuffer().catch(err => this.logger.error(`Timeout flush failed: ${err.message}`));
      }, this.flushIntervalMs);
    }
  }

  /**
   * Сбросить накопленный буфер визитов в БД
   */
  async flushBuffer(): Promise<void> {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    if (this.visitBuffer.length === 0) return;

    const batch = [...this.visitBuffer];
    this.visitBuffer = [];

    try {
      const visits = this.visitStatRepo.create(batch);
      await this.visitStatRepo.save(visits);
      this.logger.debug(`Buffered visits saved: ${batch.length} records`);
    } catch (error: any) {
      this.logger.error(`Failed to save buffered visits: ${error.message}`, error.stack);
    }
  }

  /**
   * Увеличить счётчик просмотров проекта
   */
  async incrementProjectView(projectId: number): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      await this.projectRepo.increment({ id: projectId }, 'viewCount', 1);
    } catch (error: any) {
      this.logger.error(`Failed to increment project view: ${error.message}`, error.stack);
    }
  }

  /**
   * Получить общую статистику
   */
  async getOverview(): Promise<StatsOverview> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Общее количество визитов
    const totalVisits = await this.visitStatRepo.count();

    // Уникальные посетители (по IP)
    const uniqueVisits = await this.visitStatRepo
      .createQueryBuilder('stat')
      .select('COUNT(DISTINCT stat.ip_address)', 'count')
      .where('stat.ip_address IS NOT NULL')
      .getRawOne();
    const uniqueVisitors = parseInt(uniqueVisits?.count || '0', 10);

    // Визиты за период
    const todayVisits = await this.visitStatRepo.count({
      where: { visitedAt: MoreThanOrEqual(todayStart) },
    });

    const thisWeekVisits = await this.visitStatRepo.count({
      where: { visitedAt: MoreThanOrEqual(weekStart) },
    });

    const thisMonthVisits = await this.visitStatRepo.count({
      where: { visitedAt: MoreThanOrEqual(monthStart) },
    });

    // Топ страниц
    const topPagesResult = await this.visitStatRepo
      .createQueryBuilder('stat')
      .select('stat.path', 'path')
      .addSelect('COUNT(*)', 'count')
      .groupBy('stat.path')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const topPages = topPagesResult.map((row) => ({
      path: row.path,
      count: parseInt(row.count, 10),
    }));

    // Топ стран
    const topCountriesResult = await this.visitStatRepo
      .createQueryBuilder('stat')
      .select('stat.country', 'country')
      .addSelect('COUNT(*)', 'count')
      .where('stat.country IS NOT NULL')
      .groupBy('stat.country')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const topCountries = topCountriesResult.map((row) => ({
      country: row.country,
      count: parseInt(row.count, 10),
    }));

    // Разбивка по устройствам
    const deviceBreakdownResult = await this.visitStatRepo
      .createQueryBuilder('stat')
      .select('stat.device_type', 'deviceType')
      .addSelect('COUNT(*)', 'count')
      .where('stat.device_type IS NOT NULL')
      .groupBy('stat.device_type')
      .orderBy('count', 'DESC')
      .getRawMany();

    const deviceBreakdown = deviceBreakdownResult.map((row) => ({
      deviceType: row.deviceType,
      count: parseInt(row.count, 10),
    }));

    // Разбивка по браузерам
    const browserBreakdownResult = await this.visitStatRepo
      .createQueryBuilder('stat')
      .select('stat.browser', 'browser')
      .addSelect('COUNT(*)', 'count')
      .where('stat.browser IS NOT NULL')
      .groupBy('stat.browser')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const browserBreakdown = browserBreakdownResult.map((row) => ({
      browser: row.browser,
      count: parseInt(row.count, 10),
    }));

    // Ежедневные визиты за последние 30 дней
    const thirtyDaysAgo = new Date(todayStart);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyVisitsResult = await this.visitStatRepo
      .createQueryBuilder('stat')
      .select("stat.visited_at::date", "date")
      .addSelect('COUNT(*)', 'count')
      .where('stat.visited_at >= :startDate', { startDate: thirtyDaysAgo })
      .groupBy('stat.visited_at::date')
      .orderBy('stat.visited_at::date', 'ASC')
      .getRawMany();

    const dailyVisits = dailyVisitsResult.map((row) => {
      let formattedDate = row.date;
      if (row.date && typeof row.date !== 'string') {
        try {
          formattedDate = new Date(row.date).toISOString().split('T')[0];
        } catch {
          // Игнорируем
        }
      }
      return {
        date: formattedDate,
        count: parseInt(row.count, 10),
      };
    });

    // Просмотры проектов
    const projects = await this.projectRepo.find({
      order: { viewCount: 'DESC' },
    });

    const projectViews = projects.map((p) => ({
      id: p.id,
      title: p.title,
      viewCount: p.viewCount,
    }));

    return {
      totalVisits,
      uniqueVisitors,
      todayVisits,
      thisWeekVisits,
      thisMonthVisits,
      topPages,
      topCountries,
      deviceBreakdown,
      browserBreakdown,
      dailyVisits,
      projectViews,
    };
  }

  /**
   * Получить визиты с пагинацией
   */
  async getVisits(
    page: number = 1,
    limit: number = 50,
    filters?: { path?: string; startDate?: Date; endDate?: Date },
  ): Promise<{ visits: VisitStat[]; total: number }> {
    const queryBuilder = this.visitStatRepo.createQueryBuilder('stat')
      .orderBy('stat.visitedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters?.path) {
      queryBuilder.andWhere('stat.path LIKE :path', { path: `%${filters.path}%` });
    }

    if (filters?.startDate) {
      queryBuilder.andWhere('stat.visitedAt >= :startDate', { startDate: filters.startDate });
    }

    if (filters?.endDate) {
      queryBuilder.andWhere('stat.visitedAt <= :endDate', { endDate: filters.endDate });
    }

    const [visits, total] = await queryBuilder.getManyAndCount();

    return { visits, total };
  }

  /**
   * Очистить старые данные (старше N дней)
   */
  async cleanupOldVisits(daysToKeep: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await this.visitStatRepo.delete({ visitedAt: LessThan(cutoffDate) });
    return result.affected || 0;
  }

  /**
   * Записать визит на основе HTTP запроса
   */
  async recordVisitFromRequest(req: Request, path: string, referrer?: string): Promise<void> {
    if (!this.isEnabled()) return;
    try {
      const userAgentStr = req.headers['user-agent'] || '';
      const deviceType = this.detectDeviceType(userAgentStr);
      
      const visitData = {
        ipAddress: this.getClientIp(req),
        userAgent: userAgentStr || null,
        path: path || '/',
        referrer: referrer || this.getReferrer(req),
        country: null, // Для GeoIP в будущем
        browser: this.extractBrowser(userAgentStr),
        os: this.extractOS(userAgentStr),
        deviceType,
      };

      await this.recordVisit(visitData);
    } catch (error: any) {
      this.logger.error(`Failed to record visit from request: ${error.message}`, error.stack);
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

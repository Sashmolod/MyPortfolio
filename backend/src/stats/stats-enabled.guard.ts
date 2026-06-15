import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StatsEnabledGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const isEnabled = this.configService.get<string>('ENABLE_STATS_MODULE') !== 'false';
    if (!isEnabled) {
      throw new NotFoundException('Stats module is disabled');
    }
    return true;
  }
}

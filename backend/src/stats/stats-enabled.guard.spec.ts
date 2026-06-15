import { StatsEnabledGuard } from './stats-enabled.guard';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, NotFoundException } from '@nestjs/common';

describe('StatsEnabledGuard', () => {
  let guard: StatsEnabledGuard;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockExecutionContext: ExecutionContext;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn(),
    } as any;

    mockExecutionContext = {} as any; // Не используется гвардом напрямую

    guard = new StatsEnabledGuard(mockConfigService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return true if ENABLE_STATS_MODULE is not false', () => {
    mockConfigService.get.mockReturnValue('true');
    expect(guard.canActivate(mockExecutionContext)).toBe(true);

    mockConfigService.get.mockReturnValue(undefined);
    expect(guard.canActivate(mockExecutionContext)).toBe(true);
  });

  it('should throw NotFoundException if ENABLE_STATS_MODULE is false', () => {
    mockConfigService.get.mockReturnValue('false');
    expect(() => guard.canActivate(mockExecutionContext)).toThrow(NotFoundException);
  });
});

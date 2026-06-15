import { StatsMiddleware } from './stats.middleware';
import { StatsService } from './stats.service';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

describe('StatsMiddleware', () => {
  let middleware: StatsMiddleware;
  let mockStatsService: jest.Mocked<StatsService>;
  let mockConfigService: jest.Mocked<ConfigService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    mockStatsService = {
      recordVisit: jest.fn(),
    } as any;

    mockConfigService = {
      get: jest.fn(),
    } as any;

    mockRequest = {
      method: 'GET',
      originalUrl: '/portfolio',
      headers: {},
      socket: {},
    } as any;

    mockResponse = {
      on: jest.fn(),
    } as any;

    nextFunction = jest.fn();

    middleware = new StatsMiddleware(mockStatsService, mockConfigService);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call next() and do nothing if ENABLE_STATS_MODULE is false', async () => {
    mockConfigService.get.mockReturnValue('false');

    await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.on).not.toHaveBeenCalled();
  });

  it('should call next() and setup response listener if ENABLE_STATS_MODULE is true', async () => {
    mockConfigService.get.mockReturnValue('true');

    await middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockResponse.on).toHaveBeenCalledWith('finish', expect.any(Function));
  });
});

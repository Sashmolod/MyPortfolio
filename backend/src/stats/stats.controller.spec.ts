import { Test, TestingModule } from '@nestjs/testing';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';
import { HttpStatus } from '@nestjs/common';
import { GetStatsDto } from './dto/stats.dto';

describe('StatsController', () => {
  let controller: StatsController;
  let service: StatsService;

  const mockStatsService = {
    getOverview: jest.fn(),
    getVisits: jest.fn(),
    cleanupOldVisits: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatsController],
      providers: [
        { provide: StatsService, useValue: mockStatsService },
      ],
    }).compile();

    controller = module.get<StatsController>(StatsController);
    service = module.get<StatsService>(StatsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getOverview', () => {
    it('should return stats overview successfully', async () => {
      const mockOverview = { totalVisits: 100, uniqueVisitors: 50 };
      mockStatsService.getOverview.mockResolvedValue(mockOverview);

      const result = await controller.getOverview();

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        data: mockOverview,
      });
      expect(mockStatsService.getOverview).toHaveBeenCalled();
    });

    it('should handle service errors gracefully', async () => {
      mockStatsService.getOverview.mockRejectedValue(new Error('DB error'));

      const result = await controller.getOverview();

      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка при получении статистики',
      });
    });
  });

  describe('getVisits', () => {
    it('should return paginated list of visits', async () => {
      const mockVisits = [{ id: 1, path: '/' }];
      mockStatsService.getVisits.mockResolvedValue({ visits: mockVisits, total: 1 });

      const queryDto: GetStatsDto = { page: 1, limit: 10 };
      const result = await controller.getVisits(queryDto);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        data: mockVisits,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
      expect(mockStatsService.getVisits).toHaveBeenCalledWith(1, 10, {
        path: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should handle errors in getVisits gracefully', async () => {
      mockStatsService.getVisits.mockRejectedValue(new Error('Search failed'));

      const result = await controller.getVisits({});

      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка при получении визитов',
      });
    });
  });

  describe('cleanupOldVisits', () => {
    it('should delete old stats and return deleted count', async () => {
      mockStatsService.cleanupOldVisits.mockResolvedValue(42);

      const result = await controller.cleanupOldVisits('30');

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Очищено 42 записей',
      });
      expect(mockStatsService.cleanupOldVisits).toHaveBeenCalledWith(30);
    });

    it('should default to 365 days if no value is passed', async () => {
      mockStatsService.cleanupOldVisits.mockResolvedValue(10);

      const result = await controller.cleanupOldVisits(undefined);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        message: 'Очищено 10 записей',
      });
      expect(mockStatsService.cleanupOldVisits).toHaveBeenCalledWith(365);
    });

    it('should handle service errors in cleanup', async () => {
      mockStatsService.cleanupOldVisits.mockRejectedValue(new Error('Clear failed'));

      const result = await controller.cleanupOldVisits('30');

      expect(result).toEqual({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Ошибка при очистке данных',
      });
    });
  });
});

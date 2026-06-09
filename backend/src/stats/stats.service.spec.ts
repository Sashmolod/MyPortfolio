import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StatsService } from './stats.service';
import { VisitStat } from '../admin/entities/visit-stat.entity';
import { Project } from '../admin/entities/project.entity';
import { Request } from 'express';

describe('StatsService', () => {
  let service: StatsService;
  let visitStatRepo: Repository<VisitStat>;
  let projectRepo: Repository<Project>;

  // Mock repositories
  const mockVisitStatRepo = {
    create: jest.fn((dto) => dto),
    save: jest.fn(),
    count: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockProjectRepo = {
    increment: jest.fn(),
    find: jest.fn(),
  };

  // Mock QueryBuilder chain
  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
    getRawMany: jest.fn(),
    getManyAndCount: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockVisitStatRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatsService,
        { provide: getRepositoryToken(VisitStat), useValue: mockVisitStatRepo },
        { provide: getRepositoryToken(Project), useValue: mockProjectRepo },
      ],
    }).compile();

    service = module.get<StatsService>(StatsService);
    visitStatRepo = module.get<Repository<VisitStat>>(getRepositoryToken(VisitStat));
    projectRepo = module.get<Repository<Project>>(getRepositoryToken(Project));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordVisit', () => {
    it('should save a visit record successfully', async () => {
      const visitData = { ipAddress: '127.0.0.1', path: '/' };
      mockVisitStatRepo.save.mockResolvedValue({ id: 1, ...visitData });

      await service.recordVisit(visitData);

      expect(mockVisitStatRepo.create).toHaveBeenCalledWith(visitData);
      expect(mockVisitStatRepo.save).toHaveBeenCalledWith(visitData);
    });

    it('should catch and log errors during save', async () => {
      const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation();
      mockVisitStatRepo.save.mockRejectedValue(new Error('DB Error'));

      await service.recordVisit({});

      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  describe('incrementProjectView', () => {
    it('should increment project view count', async () => {
      mockProjectRepo.increment.mockResolvedValue(undefined);

      await service.incrementProjectView(42);

      expect(mockProjectRepo.increment).toHaveBeenCalledWith({ id: 42 }, 'viewCount', 1);
    });

    it('should catch and log errors during increment', async () => {
      const loggerSpy = jest.spyOn(service['logger'], 'error').mockImplementation();
      mockProjectRepo.increment.mockRejectedValue(new Error('DB Error'));

      await service.incrementProjectView(42);

      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  describe('getOverview', () => {
    it('should return aggregated stats overview', async () => {
      mockVisitStatRepo.count.mockResolvedValue(10); // total, today, week, month
      mockQueryBuilder.getRawOne.mockResolvedValue({ count: '5' }); // unique visitors
      mockQueryBuilder.getRawMany
        .mockResolvedValueOnce([{ path: '/', count: '8' }]) // topPages
        .mockResolvedValueOnce([{ country: 'RU', count: '6' }]) // topCountries
        .mockResolvedValueOnce([{ deviceType: 'desktop', count: '7' }]) // deviceBreakdown
        .mockResolvedValueOnce([{ browser: 'Chrome', count: '9' }]) // browserBreakdown
        .mockResolvedValueOnce([{ date: '2026-06-09', count: '10' }]); // dailyVisits
      mockProjectRepo.find.mockResolvedValue([{ id: 1, title: 'Proj', viewCount: 15 }]);

      const result = await service.getOverview();

      expect(result).toEqual({
        totalVisits: 10,
        uniqueVisitors: 5,
        todayVisits: 10,
        thisWeekVisits: 10,
        thisMonthVisits: 10,
        topPages: [{ path: '/', count: 8 }],
        topCountries: [{ country: 'RU', count: 6 }],
        deviceBreakdown: [{ deviceType: 'desktop', count: 7 }],
        browserBreakdown: [{ browser: 'Chrome', count: 9 }],
        dailyVisits: [{ date: '2026-06-09', count: 10 }],
        projectViews: [{ id: 1, title: 'Proj', viewCount: 15 }],
      });
    });
  });

  describe('getVisits', () => {
    it('should return paginated visits and total count', async () => {
      const mockVisits = [{ id: 1, path: '/' } as VisitStat];
      mockQueryBuilder.getManyAndCount.mockResolvedValue([mockVisits, 1]);

      const result = await service.getVisits(1, 20, { path: '/' });

      expect(result).toEqual({ visits: mockVisits, total: 1 });
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0);
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(20);
    });
  });

  describe('cleanupOldVisits', () => {
    it('should delete old records and return affected count', async () => {
      mockVisitStatRepo.delete.mockResolvedValue({ affected: 5 });

      const result = await service.cleanupOldVisits(30);

      expect(result).toBe(5);
      expect(mockVisitStatRepo.delete).toHaveBeenCalled();
    });
  });

  describe('recordVisitFromRequest', () => {
    it('should parse request parameters and record visit', async () => {
      const mockReq = {
        ip: '127.0.0.1',
        socket: {},
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
          'referer': 'https://google.com',
        },
      } as any as Request;

      const recordSpy = jest.spyOn(service, 'recordVisit').mockResolvedValue(undefined);

      await service.recordVisitFromRequest(mockReq, '/test');

      expect(recordSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          ipAddress: '127.0.0.1',
          userAgent: mockReq.headers['user-agent'],
          path: '/test',
          referrer: 'https://google.com',
          browser: 'Chrome',
          os: 'Windows',
          deviceType: 'desktop',
        }),
      );
    });
  });
});

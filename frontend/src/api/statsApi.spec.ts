import { describe, it, expect, vi, beforeEach } from 'vitest';
import { statsApi } from './statsApi';
import api from '../api';

vi.mock('../api', () => {
  return {
    default: {
      get: vi.fn(),
    },
  };
});

describe('statsApi Client Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getOverview', () => {
    it('fetches stats overview from /stats/overview', async () => {
      const mockOverviewData = {
        totalVisits: 100,
        uniqueVisitors: 30,
        todayVisits: 5,
        thisWeekVisits: 20,
        thisMonthVisits: 80,
        topPages: [{ path: '/', count: 50 }],
        topCountries: [{ country: 'RU', count: 100 }],
        deviceBreakdown: [{ deviceType: 'desktop', count: 80 }],
        browserBreakdown: [{ browser: 'Chrome', count: 90 }],
        dailyVisits: [{ date: '2026-06-09', count: 10 }],
        projectViews: [{ id: 1, title: 'Test', viewCount: 5 }],
      };

      vi.mocked(api.get).mockResolvedValue({
        data: {
          data: mockOverviewData,
        },
      });

      const result = await statsApi.getOverview();
      expect(api.get).toHaveBeenCalledWith('/stats/overview');
      expect(result).toEqual(mockOverviewData);
    });
  });

  describe('getVisits', () => {
    it('fetches paginated visits list with query params', async () => {
      const mockVisitsResponse = {
        data: [
          {
            id: 1,
            visitedAt: '2026-06-09T10:00:00Z',
            path: '/',
            deviceType: 'desktop',
            browser: 'Chrome',
            os: 'Windows',
            referrer: '',
          },
        ],
        meta: {
          total: 15,
          page: 1,
          limit: 10,
          totalPages: 2,
        },
      };

      vi.mocked(api.get).mockResolvedValue({
        data: mockVisitsResponse,
      });

      const params = { page: 1, limit: 10, path: '/projects' };
      const result = await statsApi.getVisits(params);

      expect(api.get).toHaveBeenCalledWith('/stats/visits', { params });
      expect(result).toEqual({
        visits: mockVisitsResponse.data,
        total: mockVisitsResponse.meta.total,
        page: mockVisitsResponse.meta.page,
        limit: mockVisitsResponse.meta.limit,
        totalPages: mockVisitsResponse.meta.totalPages,
      });
    });

    it('fetches paginated visits list without params', async () => {
      const mockVisitsResponse = {
        data: [],
        meta: {
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 0,
        },
      };

      vi.mocked(api.get).mockResolvedValue({
        data: mockVisitsResponse,
      });

      const result = await statsApi.getVisits();

      expect(api.get).toHaveBeenCalledWith('/stats/visits', { params: undefined });
      expect(result).toEqual({
        visits: mockVisitsResponse.data,
        total: mockVisitsResponse.meta.total,
        page: mockVisitsResponse.meta.page,
        limit: mockVisitsResponse.meta.limit,
        totalPages: mockVisitsResponse.meta.totalPages,
      });
    });
  });

  describe('cleanupVisits', () => {
    it('sends GET request to /stats/cleanup with days parameter', async () => {
      const mockResponse = { message: 'Visits successfully cleaned up' };
      vi.mocked(api.get).mockResolvedValue({
        data: mockResponse,
      });

      const result = await statsApi.cleanupVisits(30);

      expect(api.get).toHaveBeenCalledWith('/stats/cleanup', {
        params: { days: 30 },
      });
      expect(result).toEqual(mockResponse);
    });
  });
});

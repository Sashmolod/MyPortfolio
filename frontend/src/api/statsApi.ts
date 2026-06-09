import api from '../api';

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

export interface VisitRecord {
  id: number;
  ipAddress: string | null;
  userAgent: string | null;
  path: string | null;
  referrer: string | null;
  country: string | null;
  browser: string | null;
  os: string | null;
  deviceType: string | null;
  visitedAt: string;
}

export interface VisitsResponse {
  visits: VisitRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const statsApi = {
  /**
   * Получить общую статистику
   */
  getOverview: async (): Promise<StatsOverview> => {
    const response = await api.get('/stats/overview');
    return response.data.data;
  },

  /**
   * Получить список визитов с пагинацией
   */
  getVisits: async (params?: {
    page?: number;
    limit?: number;
    path?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<VisitsResponse> => {
    const response = await api.get('/stats/visits', { params });
    return {
      visits: response.data.data,
      total: response.data.meta.total,
      page: response.data.meta.page,
      limit: response.data.meta.limit,
      totalPages: response.data.meta.totalPages,
    };
  },

  /**
   * Очистить старые визиты
   */
  cleanupVisits: async (daysToKeep?: number): Promise<{ message: string }> => {
    const response = await api.get('/stats/cleanup', {
      params: { days: daysToKeep },
    });
    return response.data;
  },
};
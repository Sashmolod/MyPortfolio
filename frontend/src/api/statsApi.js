import api from './client';

export const statsApi = {
  /**
   * Получить общую статистику
   */
  getOverview: async () => {
    const response = await api.get('/stats/overview');
    return response.data.data;
  },

  /**
   * Получить список визитов с пагинацией
   */
  getVisits: async (params) => {
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
  cleanupVisits: async (daysToKeep) => {
    const response = await api.get('/stats/cleanup', {
      params: { days: daysToKeep },
    });
    return response.data;
  },

  /**
    * Получить все категории навыков (включая подкатегории)
    */
  getSkillCategories: async () => {
    const response = await api.get('/portfolio/skills/categories');
    // API возвращает массив напрямую, не обёрнутый в { data: [...] }
    return Array.isArray(response.data) ? response.data : (response.data.data || []);
  },
};

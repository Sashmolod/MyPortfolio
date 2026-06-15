import api from './client';

const authApi = api;

/**
 * Логин пользователя
 */
export const login = async (credentials) => {
  const response = await authApi.post('/auth/login', credentials);
  return response.data;
};

/**
 * Логаут пользователя
 */
export const logout = async () => {
  const response = await authApi.post('/auth/logout');
  return response.data;
};

/**
 * Получить данные текущего пользователя
 */
export const getMe = async () => {
  const response = await authApi.get('/auth/me');
  return response.data;
};

/**
 * Создать первого администратора (seed)
 */
export const createFirstAdmin = async (credentials) => {
  const response = await authApi.post('/auth/create-first-admin', credentials);
  return response.data;
};

/**
 * Смена пароля
 */
export const changePassword = async (data) => {
  const response = await authApi.post('/auth/change-password', data);
  return response.data;
};

export default authApi;

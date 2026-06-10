import axios from 'axios';

// @ts-ignore - import.meta.env is available in Vite
// В development (Vite dev server) используем относительный путь — запросы проксируются через Vite HMR-сервер
// В production (Nginx) используем VITE_API_URL из env
const API_URL = (import.meta as any).env?.DEV
  ? '/api'
  : (import.meta as any).env?.VITE_API_URL || '/api';


const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Отправляем cookie вместе с запросами
});

/**
 * Интерфейс данных для логина
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Ответ при успешном входе
 */
export interface LoginResponse {
  message: string;
  user: {
    id: number;
    username: string;
    isActive: boolean;
  };
}

/**
 * Ответ при ошибке валидации
 */
export interface ValidationError {
  message: string[];
  statusCode: number;
  error: string;
}

/**
 * Ответ на endpoint /auth/me
 */
export interface MeResponse {
  user: {
    id: number;
    username: string;
    isActive: boolean;
    createdAt: string;
  };
}

/**
 * Логин пользователя
 */
export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await authApi.post('/auth/login', credentials);
  return response.data;
};

/**
 * Логаут пользователя
 */
export const logout = async (): Promise<{ message: string }> => {
  const response = await authApi.post('/auth/logout');
  return response.data;
};

/**
 * Получить данные текущего пользователя
 */
export const getMe = async (): Promise<MeResponse> => {
  const response = await authApi.get('/auth/me');
  return response.data;
};

/**
 * Создать первого администратора (seed)
 */
export const createFirstAdmin = async (credentials: LoginCredentials): Promise<{ message: string }> => {
  const response = await authApi.post('/auth/create-first-admin', credentials);
  return response.data;
};

/**
 * Смена пароля
 */
export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export const changePassword = async (data: ChangePasswordDto): Promise<{ message: string }> => {
  const response = await authApi.post('/auth/change-password', data);
  return response.data;
};

export default authApi;

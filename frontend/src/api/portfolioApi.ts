import axios from 'axios';

// @ts-ignore - import.meta.env is available in Vite
const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Интерфейс социальных ссылок Hero
 */
export interface SocialLinks {
  github?: string;
  linkedin?: string;
  twitter?: string;
}

/**
 * Интерфейс данных Hero
 */
export interface HeroData {
  id?: number;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  socialLinks: SocialLinks;
}

/**
 * Интерфейс данных для создания/обновления Hero
 */
export interface HeroCreateDto {
  name: string;
  title: string;
  bio?: string;
  avatar?: string;
  socialLinks?: SocialLinks;
}

const portfolioApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// ====== HERO CRUD ======

/**
 * Получить данные Hero (публичный endpoint)
 */
export const getHero = async (): Promise<HeroData> => {
  const response = await portfolioApi.get('/portfolio/hero');
  return response.data;
};

/**
 * Создать Hero данные (требуется авторизация)
 */
export const createHero = async (data: HeroCreateDto): Promise<HeroData> => {
  const response = await portfolioApi.post('/portfolio/hero', data);
  return response.data;
};

/**
 * Обновить Hero данные (требуется авторизация)
 */
export const updateHero = async (id: number, data: HeroCreateDto): Promise<HeroData> => {
  const response = await portfolioApi.put(`/portfolio/hero/${id}`, data);
  return response.data;
};

/**
 * Удалить Hero данные (требуется авторизация)
 */
export const deleteHero = async (id: number): Promise<{ message: string }> => {
  const response = await portfolioApi.delete(`/portfolio/hero/${id}`);
  return response.data;
};

// ====== SKILLS CRUD ======

export const getSkills = async () => {
  const response = await portfolioApi.get('/portfolio/skills');
  return response.data;
};

export const createSkill = async (data: any) => {
  const response = await portfolioApi.post('/portfolio/skills', data);
  return response.data;
};

export const updateSkill = async (id: number, data: any) => {
  const response = await portfolioApi.put(`/portfolio/skills/${id}`, data);
  return response.data;
};

export const deleteSkill = async (id: number) => {
  const response = await portfolioApi.delete(`/portfolio/skills/${id}`);
  return response.data;
};

// ====== PROJECTS CRUD ======

export const getProjects = async () => {
  const response = await portfolioApi.get('/portfolio/projects');
  return response.data;
};

export const createProject = async (data: any) => {
  const response = await portfolioApi.post('/portfolio/projects', data);
  return response.data;
};

export const updateProject = async (id: number, data: any) => {
  const response = await portfolioApi.put(`/portfolio/projects/${id}`, data);
  return response.data;
};

export const deleteProject = async (id: number) => {
  const response = await portfolioApi.delete(`/portfolio/projects/${id}`);
  return response.data;
};

// ====== CONTACT MESSAGES ======

export const getMessages = async () => {
  const response = await portfolioApi.get('/portfolio/messages');
  return response.data;
};

export const createMessage = async (data: any) => {
  const response = await portfolioApi.post('/portfolio/message', data);
  return response.data;
};

export default portfolioApi;
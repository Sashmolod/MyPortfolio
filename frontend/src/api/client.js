import axios from 'axios';

const API_URL = import.meta.env?.DEV
  ? '/api'
  : import.meta.env?.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Отправляем cookie вместе с запросами
});

/**
 * Интерцептор для обработки ошибок.
 * При 401 ошибке (токен протух или невалиден) — очищаем cookie и отправляем событие 'unauthorized'.
 * Это позволяет избежать жесткой перезагрузки страницы через window.location.href
 * и выполнить редирект средствами React Router.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const axiosError = error;

    if (!axiosError.response) {
      // CORS или сетевая ошибка — бэкенд недоступен или отклоняет запрос
      console.error('CORS/Network error — бэкенд недоступен:', axiosError.message);
    }

    if (axiosError.response?.status === 401) {
      // Токен истёк или невалиден — очищаем cookie
      document.cookie = 'AccessToken=; path=/api; max-age=0';

      // Если мы не на странице логина — перенаправляем через CustomEvent
      if (
        window.location.pathname !== '/login' &&
        !window.location.pathname.startsWith('/admin')
      ) {
        window.dispatchEvent(
          new CustomEvent('unauthorized', {
            detail: { redirect: window.location.pathname },
          })
        );
      }
    }
    return Promise.reject(error);
  },
);

export default api;

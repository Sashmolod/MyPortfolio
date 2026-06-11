import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // Отправляем cookie вместе с запросами
});

/**
 * Интерцептор для обработки ошибок.
 * При 401 ошибке (токен протух или невалиден) — очищаем cookie и редиректим на логин.
 * Примечание: для навигации используется window.location, так как интерцептор axios
 * не имеет доступа к React Router контексту.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // CORS или сетевая ошибка — бэкенд недоступен или отклоняет запрос
      console.error('CORS/Network error — бэкенд недоступен:', error.message);
    }

    if (error.response?.status === 401) {
      // Токен истёк или невалиден — очищаем cookie и редиректим на логин
      // Удаляем AccessToken cookie (path совпадает с тем, как установлен cookie)
      document.cookie = 'AccessToken=; path=/api; max-age=0';

      // Если мы не на странице логина — перенаправляем
      // Используем window.location для редиректа, так как интерцептор не имеет доступа к React Router
      if (
        window.location.pathname !== '/login' &&
        !window.location.pathname.startsWith('/admin')
      ) {
        window.location.href =
          '/login?redirect=' + encodeURIComponent(window.location.pathname);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

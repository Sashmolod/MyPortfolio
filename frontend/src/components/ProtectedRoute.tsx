import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Защищённый роут.
 * Если пользователь не авторизован — перенаправляет на страницу логина.
 * Если загрузка аутентификации ещё идёт — показывает скелетон.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Показываем индикатор загрузки пока проверяем аутентификацию
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666',
      }}>
        Загрузка...
      </div>
    );
  }

  // Если не авторизован — перенаправляем на /login с возвратом на исходную страницу
  if (!isAuthenticated) {
    // Если пришли сюда после logout — редирект на главную, иначе на /login
    const isLoggedOut = location.state?.loggedOut;
    return <Navigate to={isLoggedOut ? '/' : '/login'} state={{ redirect: location.pathname }} replace />;
  }

  // Пользователь авторизован — рендерим вложенный роут
  return <Outlet />;
}
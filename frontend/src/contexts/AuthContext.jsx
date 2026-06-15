import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, logout as apiLogout, getMe, changePassword as apiChangePassword } from '../api/authApi';

const AuthContext = createContext(undefined);

/**
 * Provider для аутентификации.
 * Обертывает приложение и предоставляет методы login/logout и состояние пользователя.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Проверка аутентификации (при загрузке страницы)
   */
  const checkAuth = useCallback(async () => {
    try {
      const response = await getMe();
      setUser(response.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Логин пользователя
   */
  const login = async (credentials) => {
    await apiLogin(credentials);
    // После успешного логина получаем данные пользователя
    await checkAuth();
  };

  /**
   * Логаут пользователя
   */
  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // Игнорируем ошибки при логауте (сервер может быть недоступен)
    } finally {
      setUser(null);
      setIsLoading(false);
      window.location.replace('/');
    }
  };

  /**
   * Смена пароля
   */
  const changePassword = async (data) => {
    await apiChangePassword(data);
  };

  // Проверяем аутентификацию при монтировании
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        changePassword,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Хук для использования аутентификации
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export { AuthContext };
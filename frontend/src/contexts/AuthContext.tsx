import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { login as apiLogin, logout as apiLogout, getMe, LoginCredentials, MeResponse, changePassword as apiChangePassword, ChangePasswordDto } from '../api/authApi';

/**
 * Интерфейс пользователя (без пароля)
 */
export interface AuthUser {
  id: number;
  username: string;
  isActive: boolean;
  createdAt?: string;
}

/**
 * Состояние контекста аутентификации
 */
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (data: ChangePasswordDto) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider для аутентификации.
 * Обертывает приложение и предоставляет методы login/logout и состояние пользователя.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Проверка аутентификации (при загрузке страницы)
   */
  const checkAuth = useCallback(async () => {
    try {
      const response: MeResponse = await getMe();
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
  const login = async (credentials: LoginCredentials): Promise<void> => {
    await apiLogin(credentials);
    // После успешного логина получаем данные пользователя
    await checkAuth();
  };

  /**
   * Логаут пользователя
   */
  const logout = async (): Promise<void> => {
    try {
      await apiLogout();
    } catch {
      // Игнорируем ошибки при логауте (сервер может быть недоступен)
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  /**
   * Смена пароля
   */
  const changePassword = async (data: ChangePasswordDto): Promise<void> => {
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
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export { AuthContext };
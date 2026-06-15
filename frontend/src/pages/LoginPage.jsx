import { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Helmet } from 'react-helmet-async';

/**
 * Страница логина для админ-панели.
 * Поддерживает автоматический редирект на исходную страницу после входа.
 */
export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  /**
   * Обработка формы логина
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login({ username, password });

      // Редирект на исходную страницу или в админку
      const redirect = location.state?.redirect || '/admin';
      navigate(redirect, { replace: true });
    } catch (err) {
      // Обрабатываем ошибку от NestJS (401)
      const message = err instanceof Error && err.message.includes('401')
        ? 'Неверный логин или пароль'
        : 'Ошибка подключения к серверу. Проверьте соединение.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'var(--bg)',
      backgroundImage: 'var(--bg-grid)',
      padding: '20px',
    }}>
      <Helmet>
        <title>Вход в админку | Admin Panel</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="card" style={{
        width: '100%',
        maxWidth: '400px',
      }}>
        <h1 style={{
          fontFamily: "'Architects Daughter', cursive",
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: '0.5rem',
          fontSize: '2rem',
          color: 'var(--text)',
        }}>
          Админ-панель
        </h1>
        <p style={{
          textAlign: 'center',
          marginBottom: '2rem',
          color: 'var(--text-muted)',
          fontSize: '1rem',
          fontFamily: "'Architects Daughter', cursive",
        }}>
          Войти в систему
        </p>

        {error && (
          <div className="input-error" style={{
            border: 'var(--border-style)',
            borderRadius: 'var(--sketch-radius-3)',
            color: 'var(--danger)',
            padding: '10px 14px',
            marginBottom: '1.5rem',
            fontSize: '0.95rem',
            background: 'var(--card-bg)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label 
              htmlFor="login-username"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'var(--text)',
                fontFamily: "'Architects Daughter', cursive",
              }}
            >
              Логин
            </label>
            <input
              id="login-username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label 
              htmlFor="login-password"
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: 'var(--text)',
                fontFamily: "'Architects Daughter', cursive",
              }}
            >
              Пароль
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn"
            style={{
              width: '100%',
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
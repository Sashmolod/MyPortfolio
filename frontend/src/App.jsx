import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ToastContainer from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import PageCrumpler from './components/PageCrumpler';
import ErrorBoundary from './components/ErrorBoundary';
import PublicPage from './pages/PublicPage';

// Lazy-loaded components for code splitting
const LoginPage = lazy(() =>
  import('./pages/LoginPage').then((m) => ({ default: m.LoginPage }))
);
const AdminDashboard = lazy(() => import('./admin/pages/AdminDashboard'));

/**
 * Loading fallback для lazy-loaded компонентов
 */
function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <p>Loading...</p>
    </div>
  );
}

/**
 * Админ-панель (защищённая)
 */
function AdminPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AdminDashboard />
    </Suspense>
  );
}

/**
 * Основная роутинговая компонента
 */
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Публичные route */}
      <Route
        path="/"
        element={
          <ErrorBoundary>
            <PublicPage />
          </ErrorBoundary>
        }
      />

      {/* Страница логина */}
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <Suspense fallback={<LoadingFallback />}>
              <ErrorBoundary>
                <LoginPage />
              </ErrorBoundary>
            </Suspense>
          ) : (
            <Navigate to="/admin" replace />
          )
        }
      />

      {/* Защищённые route (только для авторизованных) */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/admin"
          element={
            <ErrorBoundary>
              <AdminPage />
            </ErrorBoundary>
          }
        />
      </Route>

      {/* Всё остальное — редирект на главную */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <>
      <ToastContainer />
      <PageCrumpler />
      <AppRoutes />
    </>
  );
}

export default App;


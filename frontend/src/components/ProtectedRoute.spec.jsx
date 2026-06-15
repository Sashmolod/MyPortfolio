import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, Navigate, Outlet } from 'react-router-dom';

// Mock AuthContext
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router-dom components and hooks
vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to, state, replace }) => (
    <div data-testid="navigate" data-to={to} data-state={JSON.stringify(state)} data-replace={String(replace)} />
  )),
  Outlet: vi.fn(() => <div data-testid="outlet" />),
  useLocation: vi.fn(),
}));

describe('ProtectedRoute Guard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading indicator when auth is loading', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuthStatus: vi.fn(),
    });

    vi.mocked(useLocation).mockReturnValue({ pathname: '/admin' });

    render(<ProtectedRoute />);

    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
  });

  it('redirects to /login when user is not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuthStatus: vi.fn(),
    });

    vi.mocked(useLocation).mockReturnValue({ pathname: '/admin', state: {} });

    render(<ProtectedRoute />);

    const navigate = screen.getByTestId('navigate');
    expect(navigate).toBeInTheDocument();
    expect(navigate.getAttribute('data-to')).toBe('/login');
    expect(JSON.parse(navigate.getAttribute('data-state') || '{}')).toEqual({ redirect: '/admin' });
    expect(navigate.getAttribute('data-replace')).toBe('true');
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
  });

  it('redirects to root / when user logged out (has state.loggedOut)', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuthStatus: vi.fn(),
    });

    vi.mocked(useLocation).mockReturnValue({ pathname: '/admin', state: { loggedOut: true } });

    render(<ProtectedRoute />);

    const navigate = screen.getByTestId('navigate');
    expect(navigate).toBeInTheDocument();
    expect(navigate.getAttribute('data-to')).toBe('/');
    expect(JSON.parse(navigate.getAttribute('data-state') || '{}')).toEqual({ redirect: '/admin' });
    expect(navigate.getAttribute('data-replace')).toBe('true');
  });

  it('renders children (Outlet) when user is authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { username: 'admin' },
      login: vi.fn(),
      logout: vi.fn(),
      checkAuthStatus: vi.fn(),
    });

    vi.mocked(useLocation).mockReturnValue({ pathname: '/admin' });

    render(<ProtectedRoute />);

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });
});

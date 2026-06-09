import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { LoginPage } from './LoginPage';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
  useLocation: vi.fn(),
  useSearchParams: vi.fn(),
}));

describe('LoginPage Component', () => {
  const mockNavigate = vi.fn();
  const mockLogin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    vi.mocked(useLocation).mockReturnValue({
      pathname: '/login',
      state: { redirect: '/admin/settings' },
    } as any);
    vi.mocked(useSearchParams).mockReturnValue([new URLSearchParams(), vi.fn()] as any);

    vi.mocked(useAuth).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      isLoading: false,
      user: null,
      logout: vi.fn(),
      checkAuthStatus: vi.fn(),
    } as any);
  });

  it('renders login form fields', () => {
    const { container } = render(<LoginPage />);
    expect(screen.getByText('Войти в систему')).toBeInTheDocument();
    expect(container.querySelector('input[type="text"]')).toBeInTheDocument();
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Войти' })).toBeInTheDocument();
  });

  it('submits credentials and redirects user on success', async () => {
    mockLogin.mockResolvedValue(undefined);
    const { container } = render(<LoginPage />);

    const userVal = 'test-admin';
    const passVal = 'test-pass';

    const usernameInput = container.querySelector('input[type="text"]');
    const passwordInput = container.querySelector('input[type="password"]');

    fireEvent.change(usernameInput!, { target: { value: userVal } });
    fireEvent.change(passwordInput!, { target: { value: passVal } });
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({ username: userVal, password: passVal });
      expect(mockNavigate).toHaveBeenCalledWith('/admin/settings', { replace: true });
    });
  });

  it('displays API validation errors on failure', async () => {
    mockLogin.mockRejectedValue(new Error('Request failed with status code 401'));
    const { container } = render(<LoginPage />);

    const usernameInput = container.querySelector('input[type="text"]');
    const passwordInput = container.querySelector('input[type="password"]');

    fireEvent.change(usernameInput!, { target: { value: 'admin' } });
    fireEvent.change(passwordInput!, { target: { value: 'wrong-pass' } });
    fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

    await waitFor(() => {
      expect(screen.getByText('Неверный логин или пароль')).toBeInTheDocument();
    });
  });
});

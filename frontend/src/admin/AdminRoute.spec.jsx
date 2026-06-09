import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import AdminRoute from './AdminRoute';

vi.mock('./pages/AdminDashboard', () => ({
  default: () => <div data-testid="admin-dashboard">Admin Dashboard Rendered</div>,
}));

describe('AdminRoute Guard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders password prompt on initial load', () => {
    render(<AdminRoute />);
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter admin password')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-dashboard')).not.toBeInTheDocument();
  });

  it('shows error message on incorrect password', () => {
    render(<AdminRoute />);
    
    const input = screen.getByPlaceholderText('Enter admin password');
    const loginBtn = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(input, { target: { value: 'wrong-pass' } });
    fireEvent.click(loginBtn);

    expect(screen.getByText('Wrong password!')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-dashboard')).not.toBeInTheDocument();
  });

  it('authenticates and renders AdminDashboard on correct password input', () => {
    render(<AdminRoute />);
    
    const input = screen.getByPlaceholderText('Enter admin password');
    const loginBtn = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(input, { target: { value: 'admin123' } });
    fireEvent.click(loginBtn);

    expect(screen.queryByText('Wrong password!')).not.toBeInTheDocument();
    expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    expect(screen.getByText('Admin Dashboard Rendered')).toBeInTheDocument();
  });
});

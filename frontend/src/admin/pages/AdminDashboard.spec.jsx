import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import AdminDashboard from './AdminDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { usePortfolioSettings } from '../../contexts/SettingsContext';
import { LanguageProvider } from '../../contexts/LanguageContext';
import api from '../../api';

// Mock contexts
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../contexts/SettingsContext', () => ({
  usePortfolioSettings: vi.fn(),
}));

// Mock API
vi.mock('../../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock Subcomponents
vi.mock('../components/ConfirmDialog', () => ({
  default: () => <div data-testid="mock-confirm" />,
}));
vi.mock('../components/MediaTab', () => ({
  default: () => <div data-testid="mock-media" />,
}));
vi.mock('../components/TrashView', () => ({
  default: () => <div data-testid="mock-trash" />,
}));
vi.mock('../components/SkillForm', () => ({
  default: () => <div data-testid="mock-skill-form" />,
}));
vi.mock('../components/ProjectForm', () => ({
  default: () => <div data-testid="mock-project-form" />,
}));
vi.mock('../components/HeroForm', () => ({
  default: () => <div data-testid="mock-hero-form" />,
}));
vi.mock('../components/SocialLinkForm', () => ({
  default: () => <div data-testid="mock-social-link" />,
}));
vi.mock('../components/StatsView', () => ({
  default: () => <div data-testid="mock-stats" />,
}));

// Mock framer-motion
vi.mock('framer-motion', () => {
  const React = require('react');
  const DummyDiv = React.forwardRef(({ children, ...props }, ref) => {
    return React.createElement('div', { ref, ...props }, children);
  });
  return {
    motion: {
      div: DummyDiv,
    },
    AnimatePresence: ({ children }) => children,
  };
});

describe('AdminDashboard Page', () => {
  const mockLogout = vi.fn();
  const mockChangePassword = vi.fn();
  const mockUpdateSettingsLocally = vi.fn();
  const mockRefreshSettings = vi.fn();

  const mockSettings = {
    enableDoodly: true,
    enableSounds: true,
    enableBug: false,
    showAdminLink: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    window.toast = vi.fn();

    vi.mocked(useAuth).mockReturnValue({
      user: { username: 'admin' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: mockLogout,
      changePassword: mockChangePassword,
      checkAuth: vi.fn(),
    });

    vi.mocked(usePortfolioSettings).mockReturnValue({
      settings: mockSettings,
      updateSettingsLocally: mockUpdateSettingsLocally,
      refreshSettings: mockRefreshSettings,
      loading: false,
    });

    // Default GET response for skills
    vi.mocked(api.get).mockImplementation((url) => {
      if (url === '/admin/skills') {
        return Promise.resolve({
          data: [
            { id: 1, name: 'CSS', level: 90 },
            { id: 2, name: 'Node.js', level: 80 },
          ],
        });
      }
      if (url === '/admin/projects') {
        return Promise.resolve({
          data: [{ id: 1, title: 'Storefront', description: 'Store' }],
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  it('renders initial dashboard structure and fetches default tab (skills)', async () => {
    render(
      <LanguageProvider>
        <AdminDashboard />
      </LanguageProvider>
    );

    // Header dashboard metadata
    expect(screen.getByRole('heading', { name: 'Admin Dashboard', level: 1 })).toBeInTheDocument();

    // Loading transition state to skills fetch completion
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/skills');
      expect(screen.getByText('CSS')).toBeInTheDocument();
      expect(screen.getByText('Node.js')).toBeInTheDocument();
    });
  });

  it('switches tabs and fetches projects data', async () => {
    render(
      <LanguageProvider>
        <AdminDashboard />
      </LanguageProvider>
    );

    const projectsTabBtn = screen.getByRole('button', { name: 'Projects' });
    fireEvent.click(projectsTabBtn);

    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/admin/projects');
      expect(screen.getByText('Storefront')).toBeInTheDocument();
    });
  });

  it('toggles settings via PUT request', async () => {
    render(
      <LanguageProvider>
        <AdminDashboard />
      </LanguageProvider>
    );

    const settingsTabBtn = screen.getByRole('button', { name: 'Settings' });
    fireEvent.click(settingsTabBtn);

    const checkBug = screen.getByLabelText(/Crawling sketchy bug/i);
    fireEvent.click(checkBug);

    await waitFor(() => {
      expect(mockUpdateSettingsLocally).toHaveBeenCalledWith({
        enableBug: true,
      });
      expect(api.put).toHaveBeenCalledWith('/admin/settings', {
        enableBug: true,
      });
      expect(window.toast).toHaveBeenCalledWith(
        'Настройки обновлены / Settings updated',
        'success'
      );
    });
  });

  it('calls auth logout on exit click', () => {
    const transitionSpy = vi.fn((e) => {
      e.detail.action();
    });
    window.addEventListener('page-crumple-transition', transitionSpy);

    render(
      <LanguageProvider>
        <AdminDashboard />
      </LanguageProvider>
    );

    const logoutBtn = screen.getByRole('button', { name: 'Logout' });
    fireEvent.click(logoutBtn);

    expect(transitionSpy).toHaveBeenCalled();
    expect(mockLogout).toHaveBeenCalled();

    window.removeEventListener('page-crumple-transition', transitionSpy);
  });
});

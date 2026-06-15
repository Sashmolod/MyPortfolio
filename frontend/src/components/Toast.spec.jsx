import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import ToastContainer, { useToast } from './Toast';

// Mock framer-motion to bypass animation delays
vi.mock('framer-motion', () => {
  const React = require('react');
  const Dummy = React.forwardRef(({ children, ...props }, ref) => {
    return React.createElement('div', { ref, ...props }, children);
  });
  return {
    motion: {
      div: Dummy,
    },
    AnimatePresence: ({ children }) => children,
  };
});

describe('Toast System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers window.toast on mount and cleans up on unmount', () => {
    expect(window.toast).toBeUndefined();

    const { unmount } = render(<ToastContainer />);
    expect(window.toast).toBeTypeOf('function');

    unmount();
    expect(window.toast).toBeUndefined();
  });

  it('adds a toast to the screen when window.toast is invoked', async () => {
    render(<ToastContainer />);

    // Trigger toast
    act(() => {
      window.toast('Welcome to my portfolio!', 'success');
    });

    // Verify it is rendered
    expect(screen.getByText('Welcome to my portfolio!')).toBeInTheDocument();
    expect(screen.getByText('✓')).toBeInTheDocument(); // Success icon

    // Trigger another toast
    act(() => {
      window.toast('Danger message!', 'error');
    });
    expect(screen.getByText('Danger message!')).toBeInTheDocument();
    expect(screen.getByText('✕')).toBeInTheDocument(); // Error icon
  });

  it('removes the toast when clicked', async () => {
    render(<ToastContainer />);

    act(() => {
      window.toast('Click to dismiss me', 'info');
    });
    const toastElem = screen.getByText('Click to dismiss me');

    expect(toastElem).toBeInTheDocument();

    // Click toast to dismiss
    fireEvent.click(toastElem);

    expect(screen.queryByText('Click to dismiss me')).not.toBeInTheDocument();
  });

  it('allows useToast hook to trigger global window.toast', () => {
    const toastSpy = vi.fn();
    window.toast = toastSpy;

    const showToast = useToast();
    showToast('Hello via hook', 'warning', 2000);

    expect(toastSpy).toHaveBeenCalledWith('Hello via hook', 'warning', 2000);
    delete window.toast;
  });
});

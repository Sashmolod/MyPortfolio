import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('react-helmet-async', () => {
  const React = require('react');
  return {
    Helmet: ({ children }) => React.createElement(React.Fragment, null, children),
    HelmetProvider: ({ children }) => React.createElement(React.Fragment, null, children),
  };
});

const mockIntersectionObserver = class IntersectionObserver {
  constructor(callback, options) {
    this.callback = callback;
    this.options = options;
  }
  disconnect() {
    return null;
  }
  observe() {
    return null;
  }
  unobserve() {
    return null;
  }
};

global.IntersectionObserver = mockIntersectionObserver;
globalThis.IntersectionObserver = mockIntersectionObserver;
if (typeof window !== 'undefined') {
  window.IntersectionObserver = mockIntersectionObserver;
}

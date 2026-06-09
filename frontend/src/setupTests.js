import '@testing-library/jest-dom';

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

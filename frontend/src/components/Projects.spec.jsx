import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Projects from './Projects';
import api from '../api';

// Mock API
vi.mock('../api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({}),
  },
}));

// Mock LanguageContext hook
vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (keyOrBilingual) => {
      if (typeof keyOrBilingual !== 'string') return keyOrBilingual;
      const dict = {
        projects: 'Projects',
        viewProject: 'View Project',
      };
      if (dict[keyOrBilingual]) return dict[keyOrBilingual];
      if (keyOrBilingual.includes(' / ')) {
        return keyOrBilingual.split(' / ')[1].trim();
      }
      return keyOrBilingual;
    },
  }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => {
  const React = require('react');
  const DummyDiv = React.forwardRef(
    (
      { children, whileInView, viewport, initial, transition, ...props },
      ref
    ) => {
      return React.createElement('div', { ref, ...props }, children);
    }
  );
  return {
    motion: {
      div: DummyDiv,
    },
  };
});

describe('Projects Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders default projects when none are provided', () => {
    render(<Projects projects={[]} />);
    expect(screen.getByText('Portfolio Website')).toBeInTheDocument();
    expect(screen.getByText('E-Commerce App')).toBeInTheDocument();
  });

  it('renders custom projects lists and tags correctly', () => {
    const customProjs = [
      {
        id: 10,
        title: 'Custom Nest App',
        description: 'Complex backend',
        technologies: 'NestJS, TypeORM, PG',
        link: 'https://nestjs.org',
        image: '/custom.png',
      },
    ];

    render(<Projects projects={customProjs} />);
    expect(screen.getByText('Custom Nest App')).toBeInTheDocument();
    expect(screen.getByText('Complex backend')).toBeInTheDocument();
    expect(screen.getByText('NestJS')).toBeInTheDocument();
    expect(screen.getByText('TypeORM')).toBeInTheDocument();
    expect(screen.getByText('PG')).toBeInTheDocument();

    const img = screen.getByAltText('Custom Nest App');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBe('/custom.png');
  });

  it('calls track project view API when clicking the link button', async () => {
    const customProjs = [
      {
        id: 12,
        title: 'Tracked App',
        description: 'Tracking view clicks',
        technologies: 'React',
        link: 'https://tracked.org',
      },
    ];

    render(<Projects projects={customProjs} />);

    const btn = screen.getByRole('link', { name: 'View Project: Tracked App' });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(api.post).toHaveBeenCalledWith('/portfolio/projects/12/view');
  });
});

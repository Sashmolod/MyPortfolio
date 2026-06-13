import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Hero from './HeroSection';

// Mock framer-motion
vi.mock('framer-motion', () => {
  const React = require('react');
  const DummyDiv = React.forwardRef(
    ({ children, animate, initial, exit, transition, ...props }, ref) => {
      return React.createElement('div', { ref, ...props }, children);
    }
  );
  return {
    motion: {
      div: DummyDiv,
    },
  };
});

describe('Hero Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders default info when no data is provided', () => {
    render(<Hero data={null} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Full Stack Developer')).toBeInTheDocument();
    expect(
      screen.getByText('Passionate developer creating amazing web experiences.')
    ).toBeInTheDocument();
  });

  it('renders custom bio and name when details are passed', () => {
    const customData = {
      name: 'Jane Developer',
      title: 'UI/UX Specialist',
      bio: 'Creating beautiful systems.',
      avatar: '/custom-avatar.png',
      socialLinks: [
        { platform: 'GitHub', url: 'https://github.com/jane' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/jane' },
      ],
    };

    render(<Hero data={customData} />);
    expect(screen.getByText('Jane Developer')).toBeInTheDocument();
    expect(screen.getByText('UI/UX Specialist')).toBeInTheDocument();
    expect(screen.getByText('Creating beautiful systems.')).toBeInTheDocument();

    const img = screen.getByAltText('Jane Developer');
    expect(img).toBeInTheDocument();
    expect(img.getAttribute('src')).toBe('/custom-avatar.png');

    const githubLink = screen.getByTitle('GitHub');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink.getAttribute('href')).toBe('https://github.com/jane');
  });

  it('handles object-based social links', () => {
    const customData = {
      name: 'Jane',
      title: 'Dev',
      bio: 'Bio',
      avatar: '/favicon.svg', // will trigger DeveloperIllustration
      socialLinks: {
        github: 'https://github.com/jane',
        linkedin: 'https://linkedin.com/in/jane',
      },
    };

    render(<Hero data={customData} />);

    const githubLink = screen.getByTitle('Github');
    expect(githubLink).toBeInTheDocument();
    expect(githubLink.getAttribute('href')).toBe('https://github.com/jane');
  });
});

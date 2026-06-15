import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import Skills from './SkillsSection';
import { statsApi } from '../../api/statsApi';

// Mock SettingsContext hook
vi.mock('../../contexts/SettingsContext', () => ({
  usePortfolioSettings: () => ({
    settings: { enableDrawSkills: false },
  }),
}));

// Mock LanguageContext hook
vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (keyOrBilingual) => {
      if (typeof keyOrBilingual !== 'string') {return keyOrBilingual;}
      const dict = {
        skills: 'Skills',
        loading: 'Loading...',
        all: '+ All',
        none: '− None',
      };
      if (dict[keyOrBilingual]) {return dict[keyOrBilingual];}
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

describe('Skills Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders default skills when none are provided', async () => {
    const mockCategories = [
      {
        id: 1,
        name: 'Languages',
        skills: [
          { id: 1, name: 'JavaScript', level: 90, description: 'ES6+, TypeScript', sortOrder: 1 }
        ]
      },
      {
        id: 2,
        name: 'Libraries',
        skills: [
          { id: 2, name: 'React', level: 85, description: 'UI library', sortOrder: 1 }
        ]
      }
    ];
    vi.spyOn(statsApi, 'getSkillCategories').mockResolvedValueOnce(mockCategories);

    render(<Skills />);

    // Wait for categories to load and click "+ All" to expand
    const expandBtn = await screen.findByText('+ All');
    fireEvent.click(expandBtn);

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('renders custom skills with correct level styling', async () => {
    const customSkills = [
      {
        id: 1,
        name: 'WebAssembly',
        icon: 'wasm',
        level: 95,
        description: 'Super fast execution',
      },
      {
        id: 2,
        name: 'GraphQL',
        icon: 'graphql',
        level: 75,
        description: 'Query api',
      },
    ];
    const mockCategories = [
      {
        id: 1,
        name: 'Technologies',
        skills: customSkills
      }
    ];
    vi.spyOn(statsApi, 'getSkillCategories').mockResolvedValueOnce(mockCategories);

    render(<Skills />);

    // Wait for categories to load and click "+ All" to expand
    const expandBtn = await screen.findByText('+ All');
    fireEvent.click(expandBtn);

    expect(screen.getByText('WebAssembly')).toBeInTheDocument();
    expect(screen.getByText('GraphQL')).toBeInTheDocument();
    expect(screen.getByText('95%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
  });
});

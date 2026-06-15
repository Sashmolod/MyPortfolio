import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import Footer from './Footer';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (keyOrBilingual) => {
      const dict = {
        allRightsReserved: 'All rights reserved.',
      };
      return dict[keyOrBilingual] || keyOrBilingual;
    },
  }),
}));

describe('Footer Component', () => {
  it('renders copyright text and current year', () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(currentYear))).toBeInTheDocument();
    expect(
      screen.getByText(/MyPortfolio\. All rights reserved\./)
    ).toBeInTheDocument();
  });
});

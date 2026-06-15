/**
 * Fallback (default) data returned by PortfolioService when the database
 * does not yet contain the corresponding records.
 *
 * Keep these in sync with the seed data so that a fresh environment
 * looks reasonable before an admin fills in the real content.
 */

export interface DefaultHero {
  id: null;
  name: string;
  title: string;
  bio: string;
  avatar: null;
}

export interface DefaultSocialLink {
  platform: string;
  url: string;
}

export interface DefaultContactInfo {
  email: string;
  phone: string;
  address: string;
}

// ────────────────────────────────────────────────
//  Hero section fallback
// ────────────────────────────────────────────────
export const DEFAULT_HERO: DefaultHero = {
  id: null,
  name: 'John Doe',
  title: 'Full Stack Developer',
  bio: 'I build things for the web and beyond.',
  avatar: null,
};

// ────────────────────────────────────────────────
//  Social links fallback (shown alongside hero)
// ────────────────────────────────────────────────
export const DEFAULT_SOCIAL_LINKS: DefaultSocialLink[] = [
  { platform: 'GitHub',   url: 'https://github.com/yourusername'   },
  { platform: 'LinkedIn', url: 'https://linkedin.com/in/yourusername' },
  { platform: 'Twitter',  url: 'https://twitter.com/yourusername'  },
];

// ────────────────────────────────────────────────
//  Contact info fallback
// ────────────────────────────────────────────────
export const DEFAULT_CONTACT_INFO: DefaultContactInfo = {
  email:   'john@example.com',
  phone:   '+1 234 567 890',
  address: 'Kyiv, Ukraine',
};

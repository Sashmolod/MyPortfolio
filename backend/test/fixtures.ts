import { User, Skill, Project, Hero, ContactMessage, SocialLink, Settings } from '../src/shared/entities';

export function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    username: 'admin',
    password: 'hashedpassword123',
    isActive: true,
    loginAttempts: 0,
    lockoutUntil: null,
    createdAt: new Date('2026-06-09T00:00:00.000Z'),
    updatedAt: new Date('2026-06-09T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  };
}

export function createMockSkill(overrides: Partial<Skill> = {}): Skill {
  return {
    id: 1,
    name: 'TypeScript',
    icon: 'ts-icon',
    description: 'Modern type-safe JavaScript development',
    level: 90,
    sortOrder: 1,
    createdAt: new Date('2026-06-09T00:00:00.000Z'),
    updatedAt: new Date('2026-06-09T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  };
}

export function createMockProject(overrides: Partial<Project> = {}): Project {
  return {
    id: 1,
    title: 'E-commerce platform',
    description: 'React/Node storefront',
    image: '/uploads/store.png',
    link: 'https://github.com/my-store',
    skills: [],
    sortOrder: 2,
    viewCount: 15,
    createdAt: new Date('2026-06-09T00:00:00.000Z'),
    updatedAt: new Date('2026-06-09T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  };
}

export function createMockHero(overrides: Partial<Hero> = {}): Hero {
  return {
    id: 1,
    name: 'John Doe',
    title: 'Lead Architect',
    bio: 'Coding solutions since 2012',
    avatar: '/uploads/avatar.png',
    createdAt: new Date('2026-06-09T00:00:00.000Z'),
    updatedAt: new Date('2026-06-09T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  };
}

export function createMockMessage(overrides: Partial<ContactMessage> = {}): ContactMessage {
  return {
    id: 1,
    name: 'Jane Smith',
    email: 'jane@example.com',
    subject: 'Project inquiry',
    message: 'I would like to hire you for a React project',
    isRead: false,
    attachments: [],
    createdAt: new Date('2026-06-09T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  };
}

export function createMockSocialLink(overrides: Partial<SocialLink> = {}): SocialLink {
  return {
    id: 1,
    platform: 'GitHub',
    url: 'https://github.com/john',
    sortOrder: 1,
    createdAt: new Date('2026-06-09T00:00:00.000Z'),
    updatedAt: new Date('2026-06-09T00:00:00.000Z'),
    deletedAt: null,
    ...overrides,
  };
}

export function createMockSettings(overrides: Partial<Settings> = {}): Settings {
  return {
    id: 1,
    enableDoodly: true,
    enableSounds: true,
    enableBug: true,
    enablePageTear: true,
    enableInkLeak: true,
    enableCoffeeSpill: true,
    enableDrawSkills: true,
    enableEraser: true,
    enableCrumpledPageTransition: true,
    showAdminLink: true,
    updatedAt: new Date('2026-06-09T00:00:00.000Z'),
    ...overrides,
  };
}

export function createMockLoginDto(overrides = {}) {
  return {
    username: 'admin',
    password: 'securePassword123',
    ...overrides,
  };
}

export function createMockCreateSkillDto(overrides = {}) {
  return {
    name: 'NestJS',
    icon: 'nestjs-plain',
    description: 'Backend framework',
    level: 85,
    sortOrder: 3,
    ...overrides,
  };
}

export function createMockCreateProjectDto(overrides = {}) {
  return {
    title: 'New Project',
    description: 'Project details',
    image: '/uploads/img.png',
    link: 'https://project.com',
    skillIds: [],
    sortOrder: 1,
    ...overrides,
  };
}

export function createMockCreateContactMessageDto(overrides = {}) {
  return {
    name: 'Jane Doe',
    email: 'jane@doe.com',
    subject: 'Inquiry',
    message: 'Hello, let\'s collaborate!',
    captchaAnswer: '10',
    captchaToken: 'valid-token',
    ...overrides,
  };
}

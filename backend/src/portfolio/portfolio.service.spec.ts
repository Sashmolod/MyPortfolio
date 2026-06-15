import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { PortfolioService } from './portfolio.service';
import { Skill, Hero, Project, ContactMessage, SocialLink, Settings, SkillCategory } from '../shared/entities';
import { CreateContactMessageDto } from '../shared/dto';
import { BadRequestException } from '@nestjs/common';
import { CaptchaService } from './services/captcha.service';

const mockCaptchaService = {
  verifyCaptcha: jest.fn().mockReturnValue(true),
  generateCaptcha: jest.fn().mockReturnValue({ question: '2 + 2 = ?', token: 'mock-token' }),
};

describe('PortfolioService', () => {
  let service: PortfolioService;
  let skillRepo: Repository<Skill>;
  let heroRepo: Repository<Hero>;
  let projectRepo: Repository<Project>;
  let messageRepo: Repository<ContactMessage>;
  let socialLinkRepo: Repository<SocialLink>;
  let settingsRepo: Repository<Settings>;
  let configService: ConfigService;

  const mockSkills = [
    { id: 1, name: 'React', level: 90, sortOrder: 1 },
    { id: 2, name: 'Node.js', level: 85, sortOrder: 2 },
  ];

  const mockProjects = [
    { id: 1, title: 'Project A', description: 'Desc A', sortOrder: 1, technologies: ['React', 'CSS'] },
    { id: 2, title: 'Project B', description: 'Desc B', sortOrder: 2, technologies: ['Node.js'] },
  ];

  const mockHero = {
    id: 1,
    name: 'Jane Doe',
    title: 'Lead Architect',
    bio: 'Wobbly developer',
    avatar: 'avatar.png',
  };

  const mockSocialLinks = [
    { id: 1, platform: 'GitHub', url: 'https://github.com/jane', sortOrder: 1 },
  ];

  const mockSettings = {
    id: 1,
    siteTitle: 'My Site',
  };

  const mockSkillRepo = {
    find: jest.fn().mockResolvedValue(mockSkills),
  };

  const mockHeroRepo = {
    find: jest.fn(),
  };

  const mockProjectRepo = {
    find: jest.fn().mockResolvedValue(mockProjects),
  };

  const mockMessageRepo = {
    create: jest.fn((dto) => dto),
    save: jest.fn(async (msg) => ({ id: 42, ...msg })),
  };

  const mockSocialLinkRepo = {
    find: jest.fn().mockResolvedValue(mockSocialLinks),
  };

  const mockSettingsRepo = {
    findOne: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn(async (settings) => settings),
  };

  const mockSkillCategories = [
    { id: 1, name: 'Frontend', parentId: null, subcategories: [{ id: 3, name: 'React', parentId: 1 }] },
    { id: 2, name: 'Backend', parentId: null, subcategories: [] },
  ];

  const mockSkillCategoryRepo = {
    find: jest.fn().mockResolvedValue(mockSkillCategories),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        JWT_SECRET: 'test-secret',
        GEMINI_API_KEY: 'test-gemini-key',
        CAPTCHA_SECRET: 'captcha-secret',
      };
      return config[key as keyof typeof config];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        { provide: getRepositoryToken(Skill), useValue: mockSkillRepo },
        { provide: getRepositoryToken(SkillCategory), useValue: mockSkillCategoryRepo },
        { provide: getRepositoryToken(Hero), useValue: mockHeroRepo },
        { provide: getRepositoryToken(Project), useValue: mockProjectRepo },
        { provide: getRepositoryToken(ContactMessage), useValue: mockMessageRepo },
        { provide: getRepositoryToken(SocialLink), useValue: mockSocialLinkRepo },
        { provide: getRepositoryToken(Settings), useValue: mockSettingsRepo },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: CaptchaService, useValue: mockCaptchaService },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
    skillRepo = module.get<Repository<Skill>>(getRepositoryToken(Skill));
    heroRepo = module.get<Repository<Hero>>(getRepositoryToken(Hero));
    projectRepo = module.get<Repository<Project>>(getRepositoryToken(Project));
    messageRepo = module.get<Repository<ContactMessage>>(getRepositoryToken(ContactMessage));
    socialLinkRepo = module.get<Repository<SocialLink>>(getRepositoryToken(SocialLink));
    settingsRepo = module.get<Repository<Settings>>(getRepositoryToken(Settings));
    configService = module.get<ConfigService>(ConfigService);
  });

  describe('getAllSkills', () => {
    it('should return skills sorted by sortOrder', async () => {
      const result = await service.getAllSkills();
      expect(result).toEqual(mockSkills);
      expect(mockSkillRepo.find).toHaveBeenCalledWith({ order: { sortOrder: 'ASC' } });
    });
  });

  describe('getAllProjects', () => {
    it('should return projects sorted by sortOrder', async () => {
      const result = await service.getAllProjects();
      expect(result).toEqual(mockProjects);
      expect(mockProjectRepo.find).toHaveBeenCalledWith({
        order: { sortOrder: 'ASC' },
        relations: { skills: true },
      });
    });
  });

  describe('getHeroData', () => {
    it('should return database hero data with social links', async () => {
      mockHeroRepo.find.mockResolvedValue([mockHero]);
      const result = await service.getHeroData();
      expect(result).toEqual({
        hero: {
          id: mockHero.id,
          name: mockHero.name,
          title: mockHero.title,
          bio: mockHero.bio,
          avatar: mockHero.avatar,
        },
        socialLinks: mockSocialLinks,
      });
      expect(mockHeroRepo.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: 1,
      });
      expect(mockSocialLinkRepo.find).toHaveBeenCalledWith({ order: { sortOrder: 'ASC' } });
    });

    it('should return default hero data when database is empty', async () => {
      mockHeroRepo.find.mockResolvedValue([]);
      const result = await service.getHeroData();
      expect(result.hero.name).toBe('John Doe');
      expect(result.socialLinks).toHaveLength(3);
    });
  });

  describe('getContactInfo', () => {
    it('should return static contact details', async () => {
      const result = await service.getContactInfo();
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('phone');
    });
  });

  describe('Captcha and Messages', () => {
    it('should throw BadRequestException if captcha is incorrect', async () => {
      mockCaptchaService.verifyCaptcha.mockReturnValueOnce(false);
      const dto: CreateContactMessageDto = {
        name: 'Tester',
        email: 'test@example.com',
        subject: 'Hello',
        message: 'This is a test message of 10+ characters',
        captchaAnswer: 'incorrect',
        captchaToken: 'some:token',
      };

      await expect(service.createMessage(dto)).rejects.toThrow(BadRequestException);
    });

    it('should detect spam via honeypot and skip message creation/saving', async () => {
      mockCaptchaService.verifyCaptcha.mockReturnValueOnce(true);
      const dto: CreateContactMessageDto = {
        name: 'Bot',
        email: 'bot@spam.com',
        subject: 'Buy stuff',
        message: 'Spam spam spam spam spam spam spam spam',
        nickname: 'spambot', // honeypot triggered
        captchaAnswer: '7',
        captchaToken: 'valid:token',
      };

      const result = await service.createMessage(dto);
      expect(result.id).toBe(999999);
      expect(mockMessageRepo.save).not.toHaveBeenCalled();
    });

    it('should create and save message with correct captcha and no honeypot', async () => {
      mockCaptchaService.verifyCaptcha.mockReturnValueOnce(true);
      const dto: CreateContactMessageDto = {
        name: 'Tester',
        email: 'test@example.com',
        subject: 'Valid Message',
        message: 'This is a long valid message',
        captchaAnswer: '7',
        captchaToken: 'valid-token',
      };

      const result = await service.createMessage(dto);
      expect(result.id).toBe(42);
      expect(mockMessageRepo.create).toHaveBeenCalled();
      expect(mockMessageRepo.save).toHaveBeenCalled();
    });
  });

  describe('getSettings', () => {
    it('should find existing settings', async () => {
      mockSettingsRepo.findOne.mockResolvedValue(mockSettings);
      const result = await service.getSettings();
      expect(result).toEqual(mockSettings);
      expect(mockSettingsRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should create new settings if not found', async () => {
      mockSettingsRepo.findOne.mockResolvedValue(null);
      const result = await service.getSettings();
      expect(mockSettingsRepo.create).toHaveBeenCalledWith({ id: 1 });
      expect(mockSettingsRepo.save).toHaveBeenCalled();
    });
  });
});

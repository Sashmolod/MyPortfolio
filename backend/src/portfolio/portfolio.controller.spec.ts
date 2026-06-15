import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { CaptchaService } from './services/captcha.service';
import { GeminiService } from './services/gemini.service';
import { StatsService } from '../stats/stats.service';
import { CreateContactMessageDto } from '../shared/dto';
import { Request } from 'express';

describe('PortfolioController', () => {
  let controller: PortfolioController;
  let portfolioService: PortfolioService;
  let captchaService: CaptchaService;
  let geminiService: GeminiService;
  let statsService: StatsService;

  const mockPortfolioService = {
    getHeroData: jest.fn(),
    getAllSkills: jest.fn(),
    getAllSkillCategories: jest.fn(),
    getAllProjects: jest.fn(),
    getContactInfo: jest.fn(),
    createMessage: jest.fn(),
    getSettings: jest.fn(),
  };

  const mockCaptchaService = {
    generateCaptcha: jest.fn(),
    verifyCaptcha: jest.fn(),
  };

  const mockGeminiService = {
    askDoodlyChat: jest.fn(),
    guessDoodle: jest.fn(),
  };

  const mockStatsService = {
    recordVisitFromRequest: jest.fn(),
    incrementProjectView: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioController],
      providers: [
        { provide: PortfolioService, useValue: mockPortfolioService },
        { provide: CaptchaService,   useValue: mockCaptchaService   },
        { provide: GeminiService,    useValue: mockGeminiService    },
        { provide: StatsService,     useValue: mockStatsService     },
      ],
    }).compile();

    controller    = module.get<PortfolioController>(PortfolioController);
    portfolioService = module.get<PortfolioService>(PortfolioService);
    captchaService   = module.get<CaptchaService>(CaptchaService);
    geminiService    = module.get<GeminiService>(GeminiService);
    statsService     = module.get<StatsService>(StatsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ====== HERO ======

  describe('getHeroData', () => {
    it('should return hero data from service', async () => {
      const heroMock = { name: 'Alex' };
      mockPortfolioService.getHeroData.mockResolvedValue(heroMock);

      const result = await controller.getHeroData();
      expect(result).toBe(heroMock);
      expect(mockPortfolioService.getHeroData).toHaveBeenCalled();
    });
  });

  // ====== SKILLS ======

  describe('getAllSkills', () => {
    it('should return all skills', async () => {
      const skillsMock = [{ name: 'NestJS' }];
      mockPortfolioService.getAllSkills.mockResolvedValue(skillsMock);

      const result = await controller.getAllSkills();
      expect(result).toBe(skillsMock);
    });
  });

  describe('getAllSkillCategories', () => {
    it('should return skill categories', async () => {
      const categoriesMock = [{ id: 1, name: 'Backend' }];
      mockPortfolioService.getAllSkillCategories.mockResolvedValue(categoriesMock);

      const result = await controller.getAllSkillCategories();
      expect(result).toBe(categoriesMock);
      expect(mockPortfolioService.getAllSkillCategories).toHaveBeenCalled();
    });
  });

  // ====== PROJECTS ======

  describe('getAllProjects', () => {
    it('should return all projects', async () => {
      const projectsMock = [{ title: 'Site' }];
      mockPortfolioService.getAllProjects.mockResolvedValue(projectsMock);

      const result = await controller.getAllProjects();
      expect(result).toBe(projectsMock);
    });
  });

  // ====== CONTACT ======

  describe('getContactInfo', () => {
    it('should return contact info', async () => {
      const contactMock = { email: 'test@test.com' };
      mockPortfolioService.getContactInfo.mockResolvedValue(contactMock);

      const result = await controller.getContactInfo();
      expect(result).toBe(contactMock);
    });
  });

  describe('getCaptcha', () => {
    it('should return generated captcha from CaptchaService', () => {
      const captchaMock = { question: '2 + 2', token: 'tok' };
      mockCaptchaService.generateCaptcha.mockReturnValue(captchaMock);

      const result = controller.getCaptcha();
      expect(result).toBe(captchaMock);
      expect(mockCaptchaService.generateCaptcha).toHaveBeenCalled();
    });
  });

  describe('createMessage', () => {
    it('should submit contact message', async () => {
      const dto: CreateContactMessageDto = {
        name: 'Bob',
        email: 'bob@bob.com',
        subject: 'Test Subject',
        message: 'Hello, this is a test message',
        captchaAnswer: '12',
        captchaToken: '12345:signature',
      };
      const savedMock = { id: 1, ...dto };
      mockPortfolioService.createMessage.mockResolvedValue(savedMock);

      const result = await controller.createMessage(dto);
      expect(result).toBe(savedMock);
      expect(mockPortfolioService.createMessage).toHaveBeenCalledWith(dto);
    });
  });

  // ====== DOODLY (GeminiService) ======

  describe('askDoodlyChat', () => {
    it('should query Doodly chat via GeminiService and return answer', async () => {
      const responseMock = { response: 'Hello!' };
      mockGeminiService.askDoodlyChat.mockResolvedValue(responseMock);

      const result = await controller.askDoodlyChat({ message: 'Hi' });
      expect(result).toBe(responseMock);
      expect(mockGeminiService.askDoodlyChat).toHaveBeenCalledWith('Hi', undefined);
    });
  });

  describe('guessDoodle', () => {
    it('should guess sketch via GeminiService', async () => {
      const responseMock = { guess: 'A cat!' };
      mockGeminiService.guessDoodle.mockResolvedValue(responseMock);

      const result = await controller.guessDoodle({ image: 'base64str' });
      expect(result).toBe(responseMock);
      expect(mockGeminiService.guessDoodle).toHaveBeenCalledWith('base64str', undefined);
    });
  });

  // ====== SETTINGS ======

  describe('getSettings', () => {
    it('should return site settings', async () => {
      const settingsMock = { enableDoodly: true };
      mockPortfolioService.getSettings.mockResolvedValue(settingsMock);

      const result = await controller.getSettings();
      expect(result).toBe(settingsMock);
    });
  });

  // ====== STATS ======

  describe('trackVisit', () => {
    it('should call statsService to record visit from request', async () => {
      const body = { path: '/home', referrer: 'google.com' };
      const mockReq = {} as Request;
      mockStatsService.recordVisitFromRequest.mockResolvedValue(undefined);

      const result = await controller.trackVisit(body, mockReq);

      expect(result).toEqual({ success: true });
      expect(mockStatsService.recordVisitFromRequest).toHaveBeenCalledWith(mockReq, '/home', 'google.com');
    });
  });

  describe('trackProjectView', () => {
    it('should call statsService to increment project view', async () => {
      mockStatsService.incrementProjectView.mockResolvedValue(undefined);

      const result = await controller.trackProjectView(12);

      expect(result).toEqual({ success: true });
      expect(mockStatsService.incrementProjectView).toHaveBeenCalledWith(12);
    });
  });
});

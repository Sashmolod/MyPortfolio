import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { GeminiService } from './gemini.service';
import { Skill, Hero, Project } from '../../shared/entities';

describe('GeminiService', () => {
  let service: GeminiService;
  let heroRepo: Repository<Hero>;

  const mockSkills = [
    { id: 1, name: 'React', level: 90, sortOrder: 1 },
  ];

  const mockProjects = [
    { id: 1, title: 'Project A', description: 'Desc A', sortOrder: 1, technologies: ['React'] },
  ];

  const mockHero = {
    id: 1,
    name: 'Jane Doe',
    title: 'Lead Architect',
    bio: 'Wobbly developer',
  };

  const mockSkillRepo = {
    find: jest.fn().mockResolvedValue(mockSkills),
  };

  const mockHeroRepo = {
    find: jest.fn().mockResolvedValue([mockHero]),
  };

  const mockProjectRepo = {
    find: jest.fn().mockResolvedValue(mockProjects),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config = {
        GEMINI_API_KEY: 'test-gemini-key',
      };
      return config[key as keyof typeof config];
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        { provide: getRepositoryToken(Skill), useValue: mockSkillRepo },
        { provide: getRepositoryToken(Hero), useValue: mockHeroRepo },
        { provide: getRepositoryToken(Project), useValue: mockProjectRepo },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
    heroRepo = module.get<Repository<Hero>>(getRepositoryToken(Hero));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Doodly Chat and Guess Doodle', () => {
    it('should return offline reply if GEMINI_API_KEY is not defined', async () => {
      mockConfigService.get.mockReturnValueOnce(undefined); // API key
      const result = await service.askDoodlyChat('Hello');
      expect(result.response).toBeDefined();
      expect(typeof result.response).toBe('string');
    });

    it('should return offline guess if GEMINI_API_KEY is not defined', async () => {
      mockConfigService.get.mockReturnValueOnce(undefined); // API key
      const result = await service.guessDoodle('data:image/png;base64,image');
      expect(result.guess).toBeDefined();
      expect(typeof result.guess).toBe('string');
    });

    it('should fetch and return AI response when GEMINI_API_KEY is present', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'GEMINI_API_KEY') return 'valid-key';
        return undefined;
      });

      const mockFetchResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          candidates: [
            {
              content: {
                parts: [{ text: 'Hello, I am Doodly!' }],
              },
            },
          ],
        }),
      };
      global.fetch = jest.fn().mockResolvedValue(mockFetchResponse);

      const result = await service.askDoodlyChat('Hello');
      expect(result.response).toBe('Hello, I am Doodly!');
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should fallback to error response on fetch failure', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'GEMINI_API_KEY') return 'valid-key';
        return undefined;
      });
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });

      const result = await service.askDoodlyChat('Hello');
      expect(result.response).toContain('связь с моим AI-мозгом');
    });

    it('should guess doodle when GEMINI_API_KEY is present', async () => {
      mockConfigService.get.mockImplementation((key) => {
        if (key === 'GEMINI_API_KEY') return 'valid-key';
        return undefined;
      });

      const mockFetchResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          candidates: [
            {
              content: {
                parts: [{ text: 'This looks like a cat!' }],
              },
            },
          ],
        }),
      };
      global.fetch = jest.fn().mockResolvedValue(mockFetchResponse);

      const result = await service.guessDoodle('data:image/png;base64,image');
      expect(result.guess).toBe('This looks like a cat!');
      expect(global.fetch).toHaveBeenCalled();
    });
  });
});

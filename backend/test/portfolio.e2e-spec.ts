import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppModule } from '../src/app.module';
import { User } from '../src/admin/entities/user.entity';
import { Skill } from '../src/admin/entities/skill.entity';
import { Project } from '../src/admin/entities/project.entity';
import { Hero } from '../src/admin/entities/hero.entity';
import { ContactMessage } from '../src/admin/entities/contact-message.entity';
import { SocialLink } from '../src/admin/entities/social-link.entity';
import { Settings } from '../src/admin/entities/settings.entity';
import { VisitStat } from '../src/admin/entities/visit-stat.entity';
import { AuditLog } from '../src/admin/entities/audit-log.entity';
import { PortfolioService } from '../src/portfolio/portfolio.service';
import {
  createMockHero,
  createMockSkill,
  createMockProject,
  createMockSocialLink,
  createMockSettings,
} from './fixtures';

describe('PortfolioController (e2e)', () => {
  let app: INestApplication;
  let portfolioService: PortfolioService;

  const mockUserRepo = { find: jest.fn(), findOne: jest.fn(), count: jest.fn() };
  const mockSkillRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn() };
  const mockProjectRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), increment: jest.fn() };
  const mockHeroRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn() };
  const mockMessageRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), create: jest.fn() };
  const mockSocialLinkRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn() };
  const mockSettingsRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn() };
  const mockVisitStatRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), create: jest.fn() };
  const mockAuditLogRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), create: jest.fn() };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(User)).useValue(mockUserRepo)
      .overrideProvider(getRepositoryToken(Skill)).useValue(mockSkillRepo)
      .overrideProvider(getRepositoryToken(Project)).useValue(mockProjectRepo)
      .overrideProvider(getRepositoryToken(Hero)).useValue(mockHeroRepo)
      .overrideProvider(getRepositoryToken(ContactMessage)).useValue(mockMessageRepo)
      .overrideProvider(getRepositoryToken(SocialLink)).useValue(mockSocialLinkRepo)
      .overrideProvider(getRepositoryToken(Settings)).useValue(mockSettingsRepo)
      .overrideProvider(getRepositoryToken(VisitStat)).useValue(mockVisitStatRepo)
      .overrideProvider(getRepositoryToken(AuditLog)).useValue(mockAuditLogRepo)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    portfolioService = moduleFixture.get<PortfolioService>(PortfolioService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/portfolio/hero', () => {
    it('returns public hero representation and active link items', async () => {
      const mockHero = createMockHero({ name: 'Alexander' });
      const mockLinks = [createMockSocialLink({ platform: 'GitHub' })];

      mockHeroRepo.find.mockResolvedValue([mockHero]);
      mockSocialLinkRepo.find.mockResolvedValue(mockLinks);

      const res = await request(app.getHttpServer())
        .get('/api/portfolio/hero')
        .expect(200);

      expect(res.body.name).toBe('Alexander');
      expect(res.body.socialLinks).toHaveLength(1);
      expect(res.body.socialLinks[0].platform).toBe('GitHub');
    });
  });

  describe('GET /api/portfolio/skills', () => {
    it('returns list of non-deleted skills', async () => {
      const mockSkills = [createMockSkill({ name: 'Node.js' })];
      mockSkillRepo.find.mockResolvedValue(mockSkills);

      const res = await request(app.getHttpServer())
        .get('/api/portfolio/skills')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Node.js');
    });
  });

  describe('GET /api/portfolio/projects', () => {
    it('returns list of non-deleted projects', async () => {
      const mockProjects = [createMockProject({ title: 'AI Brain' })];
      mockProjectRepo.find.mockResolvedValue(mockProjects);

      const res = await request(app.getHttpServer())
        .get('/api/portfolio/projects')
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('AI Brain');
    });
  });

  describe('GET /api/portfolio/contact', () => {
    it('returns admin contact info and social links', async () => {
      const mockHero = createMockHero({ name: 'Test User' });
      const mockLinks = [createMockSocialLink({ platform: 'LinkedIn' })];

      mockHeroRepo.findOne.mockResolvedValue(mockHero);
      mockSocialLinkRepo.find.mockResolvedValue(mockLinks);

      const res = await request(app.getHttpServer())
        .get('/api/portfolio/contact')
        .expect(200);

      expect(res.body.email).toBe('john@example.com');
      expect(res.body.phone).toBe('+1 234 567 890');
      expect(res.body.address).toBe('Kyiv, Ukraine');
    });
  });

  describe('GET /api/portfolio/captcha', () => {
    it('generates a math captcha challenge', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/portfolio/captcha')
        .expect(200);

      expect(res.body.question).toBeDefined();
      expect(res.body.token).toBeDefined();
    });
  });

  describe('POST /api/portfolio/message', () => {
    it('rejects invalid message payloads with 400', async () => {
      const badPayload = { name: '', email: 'not-an-email', message: 'Hi' };

      const res = await request(app.getHttpServer())
        .post('/api/portfolio/message')
        .send(badPayload)
        .expect(400);

      expect(res.body.message).toBeDefined();
    });

    it('rejects spam attempts triggered by nickname honeypot', async () => {
      const spamPayload = {
        name: 'Spammer',
        email: 'spam@bot.com',
        subject: 'Buy drugs',
        message: 'Cheap meds here',
        nickname: 'botuser', // honeypot filled
      };

      const res = await request(app.getHttpServer())
        .post('/api/portfolio/message')
        .send(spamPayload)
        .expect(201); // Controller intercepts and returns dummy success to fool bots

      expect(res.body.id).toBe(999999);
      expect(mockMessageRepo.save).not.toHaveBeenCalled();
    });

    it('successfully stores message if captcha is valid', async () => {
      // 1. Get a valid captcha from endpoint
      const captchaRes = await request(app.getHttpServer())
        .get('/api/portfolio/captcha')
        .expect(200);

      const { question, token } = captchaRes.body;
      // Extract answer from question text (e.g. "5 + 3 = ?")
      const expression = question.replace(' = ?', '');
      const answer = eval(expression).toString();

      const validPayload = {
        name: 'Real Human',
        email: 'human@earth.com',
        subject: 'Cooperation',
        message: 'This is a genuine inquiry from a human developer.',
        captchaAnswer: answer,
        captchaToken: token,
      };

      const savedMessage = { id: 42, ...validPayload };
      mockMessageRepo.create.mockReturnValue(savedMessage);
      mockMessageRepo.save.mockResolvedValue(savedMessage);

      const res = await request(app.getHttpServer())
        .post('/api/portfolio/message')
        .send(validPayload)
        .expect(201);

      expect(res.body.id).toBe(42);
      expect(mockMessageRepo.save).toHaveBeenCalled();
    });

    it('rejects message if captcha answer is incorrect', async () => {
      const captchaRes = await request(app.getHttpServer())
        .get('/api/portfolio/captcha')
        .expect(200);

      const { token } = captchaRes.body;

      const invalidPayload = {
        name: 'Real Human',
        email: 'human@earth.com',
        subject: 'Cooperation',
        message: 'This is a genuine inquiry.',
        captchaAnswer: '999',
        captchaToken: token,
      };

      const res = await request(app.getHttpServer())
        .post('/api/portfolio/message')
        .send(invalidPayload)
        .expect(400);

      expect(res.body.message).toContain('Incorrect captcha answer');
    });
  });

  describe('POST /api/portfolio/track-visit', () => {
    it('records user visit stat log', async () => {
      mockVisitStatRepo.create.mockReturnValue({});
      mockVisitStatRepo.save.mockResolvedValue({});

      const res = await request(app.getHttpServer())
        .post('/api/portfolio/track-visit')
        .send({ path: '/projects', referrer: 'https://google.com' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(mockVisitStatRepo.save).toHaveBeenCalled();
    });
  });

  describe('POST /api/portfolio/projects/:id/view', () => {
    it('increments project view counter', async () => {
      mockProjectRepo.increment.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .post('/api/portfolio/projects/5/view')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(mockProjectRepo.increment).toHaveBeenCalledWith({ id: 5 }, 'viewCount', 1);
    });
  });

  describe('POST /api/portfolio/doodly/*', () => {
    it('asks Doodly Chat AI chatbot assistant', async () => {
      jest.spyOn(portfolioService, 'askDoodlyChat').mockResolvedValue({
        response: 'Hello, I am Doodly!',
      });

      const res = await request(app.getHttpServer())
        .post('/api/portfolio/doodly/chat')
        .send({ message: 'Who are you?' })
        .expect(201);

      expect(res.body.response).toBe('Hello, I am Doodly!');
    });

    it('submits base64 canvas image for AI doodle guessing', async () => {
      jest.spyOn(portfolioService, 'guessDoodle').mockResolvedValue({
        guess: 'A smiling coffee cup',
      });

      const res = await request(app.getHttpServer())
        .post('/api/portfolio/doodly/guess')
        .send({ image: 'data:image/png;base64,abcdef...' })
        .expect(201);

      expect(res.body.guess).toBe('A smiling coffee cup');
    });
  });

  describe('GET /api/portfolio/settings', () => {
    it('returns public site configuration settings', async () => {
      const mockSettings = createMockSettings({ enableDoodly: false });
      mockSettingsRepo.findOne.mockResolvedValue(mockSettings);

      const res = await request(app.getHttpServer())
        .get('/api/portfolio/settings')
        .expect(200);

      expect(res.body.enableDoodly).toBe(false);
    });
  });
});

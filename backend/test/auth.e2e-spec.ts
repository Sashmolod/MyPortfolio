import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import cookieParser from 'cookie-parser';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/admin/auth.service';
import { User } from '../src/admin/entities/user.entity';
import { Skill } from '../src/admin/entities/skill.entity';
import { Project } from '../src/admin/entities/project.entity';
import { Hero } from '../src/admin/entities/hero.entity';
import { ContactMessage } from '../src/admin/entities/contact-message.entity';
import { SocialLink } from '../src/admin/entities/social-link.entity';
import { Settings } from '../src/admin/entities/settings.entity';
import { VisitStat } from '../src/admin/entities/visit-stat.entity';
import { AuditLog } from '../src/admin/entities/audit-log.entity';
import { createMockUser } from './fixtures';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let authService: AuthService;
  let jwtService: JwtService;
  let authToken: string;

  const mockUserRepo = { findOne: jest.fn(), count: jest.fn(), save: jest.fn().mockImplementation((u) => Promise.resolve(u)), create: jest.fn().mockImplementation((dto) => dto), update: jest.fn().mockResolvedValue({}) };
  const mockSkillRepo = { find: jest.fn() };
  const mockProjectRepo = { find: jest.fn() };
  const mockHeroRepo = { find: jest.fn() };
  const mockMessageRepo = { find: jest.fn() };
  const mockSocialLinkRepo = { find: jest.fn() };
  const mockSettingsRepo = { find: jest.fn() };
  const mockVisitStatRepo = { find: jest.fn(), save: jest.fn(), create: jest.fn().mockImplementation((dto) => dto) };
  const mockAuditLogRepo = { find: jest.fn(), save: jest.fn(), create: jest.fn() };

  const mockAuthService = {
    login: jest.fn(),
    logout: jest.fn(),
    refreshTokens: jest.fn(),
    getCurrentUser: jest.fn(),
    createDefaultAdmin: jest.fn(),
    changePassword: jest.fn(),
    isBlacklisted: jest.fn(),
  };

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
      .overrideProvider(AuthService).useValue(mockAuthService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();

    authService = moduleFixture.get<AuthService>(AuthService);
    jwtService = moduleFixture.get<JwtService>(JwtService);
    authToken = jwtService.sign({ sub: 1, username: 'admin' });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUserRepo.findOne.mockResolvedValue(createMockUser({ id: 1, username: 'admin' }));
    mockAuthService.isBlacklisted.mockResolvedValue(false);
  });

  describe('POST /api/auth/login', () => {
    it('sets access and refresh cookies upon valid login details', async () => {
      const payload = { username: 'admin', accessToken: 'mock-access', refreshToken: 'mock-refresh', expiresIn: 3600, user: { id: 1, username: 'admin' } };
      mockAuthService.login.mockResolvedValue(payload);

      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'securePassword123' })
        .expect(200);

      expect(res.body.accessToken).toBe('mock-access');
      expect(res.headers['set-cookie']).toBeDefined();
      
      // Verify cookie properties
      const cookies = (res.headers['set-cookie'] as unknown as string[]).join(';');
      expect(cookies).toContain('AccessToken=mock-access');
      expect(cookies).toContain('RefreshToken=mock-refresh');
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('returns 401 if refresh cookie is missing', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .expect(401);
    });

    it('renews access and refresh tokens if valid refresh token cookie exists', async () => {
      const payload = { accessToken: 'new-access', refreshToken: 'new-refresh', expiresIn: 3600 };
      mockAuthService.refreshTokens.mockResolvedValue(payload);

      const res = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', ['RefreshToken=valid-refresh-token'])
        .expect(200);

      expect(res.body.accessToken).toBe('new-access');
      const cookies = (res.headers['set-cookie'] as unknown as string[]).join(';');
      expect(cookies).toContain('AccessToken=new-access');
      expect(cookies).toContain('RefreshToken=new-refresh');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('clears session cookies on logout', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Cookie', ['RefreshToken=token-to-clear'])
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.message).toBe('Вы вышли из системы');
      const cookies = (res.headers['set-cookie'] as unknown as string[]).join(';');
      expect(cookies).toContain('AccessToken=;');
      expect(cookies).toContain('RefreshToken=;');
    });
  });
});

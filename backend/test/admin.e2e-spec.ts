import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../src/app.module';
import { User, Skill, Project, Hero, ContactMessage, SocialLink, Settings, VisitStat, AuditLog } from '../src/shared/entities';
import { createMockUser, createMockSkill, createMockProject, createMockSettings } from './fixtures';

describe('AdminController (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let authToken: string;

  const mockUserRepo = { findOne: jest.fn(), count: jest.fn(), save: jest.fn().mockImplementation((u) => Promise.resolve(u)), create: jest.fn().mockImplementation((dto) => dto), update: jest.fn().mockResolvedValue({}) };
  const mockSkillRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), create: jest.fn(), update: jest.fn(), softDelete: jest.fn(), restore: jest.fn() };
  const mockProjectRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), create: jest.fn(), update: jest.fn(), softDelete: jest.fn(), restore: jest.fn() };
  const mockHeroRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), create: jest.fn(), update: jest.fn(), softDelete: jest.fn(), restore: jest.fn() };
  const mockMessageRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), create: jest.fn(), update: jest.fn(), softDelete: jest.fn(), restore: jest.fn() };
  const mockSocialLinkRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), create: jest.fn(), update: jest.fn(), softDelete: jest.fn(), restore: jest.fn() };
  const mockSettingsRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), update: jest.fn() };
  const mockVisitStatRepo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn(), create: jest.fn().mockImplementation((dto) => dto) };
  
  // We mock save and create for AuditLog to check interceptor execution
  const mockAuditLogRepo = {
    create: jest.fn().mockImplementation((dto) => dto),
    save: jest.fn().mockImplementation((log) => Promise.resolve({ id: 99, ...log })),
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

    jwtService = moduleFixture.get<JwtService>(JwtService);
    // Sign a token that matches our mock user
    authToken = jwtService.sign({ sub: 1, username: 'admin' });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Always resolve the default mock user on jwt validate check
    mockUserRepo.findOne.mockResolvedValue(createMockUser({ id: 1, username: 'admin' }));
  });

  describe('JWT Guard checks', () => {
    it('returns 401 Unauthorized if no JWT is provided', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/skills')
        .expect(401);
    });

    it('returns 200 Ok when valid JWT is supplied in Authorization header', async () => {
      mockSkillRepo.find.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/api/admin/skills')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });
  });

  describe('Skills CRUD with Auditing', () => {
    it('GET /api/admin/skills returns all skills', async () => {
      const skills = [createMockSkill({ id: 10, name: 'Angular' })];
      mockSkillRepo.find.mockResolvedValue(skills);

      const res = await request(app.getHttpServer())
        .get('/api/admin/skills')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].name).toBe('Angular');
    });

    it('POST /api/admin/skills validates input and creates skill, triggering Audit Log', async () => {
      const payload = { name: 'Rust', level: 85, sortOrder: 5 };
      const savedSkill = createMockSkill({ id: 2, ...payload });

      mockSkillRepo.create.mockReturnValue(savedSkill);
      mockSkillRepo.save.mockResolvedValue(savedSkill);

      const res = await request(app.getHttpServer())
        .post('/api/admin/skill')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(201);

      expect(res.body.id).toBe(2);
      expect(res.body.name).toBe('Rust');
      
      // Verify the AuditLogInterceptor interceptor intercepted the POST request and saved a log
      expect(mockAuditLogRepo.save).toHaveBeenCalled();
      const savedLog = mockAuditLogRepo.save.mock.calls[0][0];
      expect(savedLog.action).toBe('POST /api/admin/skill');
      expect(savedLog.username).toBe('admin');
    });

    it('PUT /api/admin/skills/:id updates skill, triggering Audit Log', async () => {
      const payload = { name: 'Rust Updated' };
      const targetSkill = createMockSkill({ id: 2, name: 'Rust' });

      mockSkillRepo.findOne.mockResolvedValue(targetSkill);
      mockSkillRepo.update.mockResolvedValue(undefined);

      const res = await request(app.getHttpServer())
        .put('/api/admin/skill/2')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(mockAuditLogRepo.save).toHaveBeenCalled();
      const savedLog = mockAuditLogRepo.save.mock.calls[0][0];
      expect(savedLog.action).toBe('PUT /api/admin/skill/2');
    });

    it('DELETE /api/admin/skills/:id soft deletes skill', async () => {
      const targetSkill = createMockSkill({ id: 2 });
      mockSkillRepo.findOne.mockResolvedValue(targetSkill);
      mockSkillRepo.save.mockResolvedValue(targetSkill);

      await request(app.getHttpServer())
        .delete('/api/admin/skill/2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(mockAuditLogRepo.save).toHaveBeenCalled();
      const savedLog = mockAuditLogRepo.save.mock.calls[0][0];
      expect(savedLog.action).toBe('DELETE /api/admin/skill/2');
    });
  });

  describe('Projects CRUD', () => {
    it('POST /api/admin/projects creates project', async () => {
      const payload = { title: 'Web App', description: 'React App', skillIds: [] };
      const savedProj = createMockProject({ id: 5, ...payload });

      mockProjectRepo.create.mockReturnValue(savedProj);
      mockProjectRepo.save.mockResolvedValue(savedProj);

      const res = await request(app.getHttpServer())
        .post('/api/admin/project')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(201);

      expect(mockAuditLogRepo.save).toHaveBeenCalled();
      const savedLog = mockAuditLogRepo.save.mock.calls[0][0];
      expect(savedLog.action).toBe('POST /api/admin/project');
    });
  });

  describe('Settings CRUD', () => {
    it('GET /api/admin/settings', async () => {
      const settings = createMockSettings({ enableDoodly: true });
      mockSettingsRepo.findOne.mockResolvedValue(settings);

      const res = await request(app.getHttpServer())
        .get('/api/admin/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body.enableDoodly).toBe(true);
    });

    it('PUT /api/admin/settings updates settings config', async () => {
      const payload = { enableSounds: false };
      const existingSettings = createMockSettings({ enableSounds: true });

      mockSettingsRepo.findOne.mockResolvedValue(existingSettings);
      mockSettingsRepo.update.mockImplementation((id, dto) => {
        Object.assign(existingSettings, dto);
        return Promise.resolve();
      });

      const res = await request(app.getHttpServer())
        .put('/api/admin/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(200);

      expect(res.body.enableSounds).toBe(false);
      expect(mockAuditLogRepo.save).toHaveBeenCalled();
      const savedLog = mockAuditLogRepo.save.mock.calls[0][0];
      expect(savedLog.action).toBe('PUT /api/admin/settings');
    });
  });

  describe('Hero CRUD', () => {
    it('GET /api/admin/hero gets hero details', async () => {
      mockHeroRepo.find.mockResolvedValue([{ id: 1, name: 'Alice', title: 'Developer' }]);
      const res = await request(app.getHttpServer())
        .get('/api/admin/hero')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(res.body[0].name).toBe('Alice');
    });

    it('POST /api/admin/hero updates or creates hero section', async () => {
      const payload = { name: 'Bob', title: 'Designer' };
      mockHeroRepo.create.mockReturnValue(payload);
      mockHeroRepo.save.mockResolvedValue({ id: 1, ...payload });

      const res = await request(app.getHttpServer())
        .post('/api/admin/hero')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(201);

      expect(res.body.name).toBe('Bob');
      expect(mockAuditLogRepo.save).toHaveBeenCalled();
      const savedLog = mockAuditLogRepo.save.mock.calls[0][0];
      expect(savedLog.action).toBe('POST /api/admin/hero');
    });
  });

  describe('Social Link CRUD', () => {
    it('POST /api/admin/social-link creates social link', async () => {
      const payload = { platform: 'LinkedIn', url: 'https://linkedin.com' };
      mockSocialLinkRepo.create.mockReturnValue(payload);
      mockSocialLinkRepo.save.mockResolvedValue({ id: 5, ...payload });

      const res = await request(app.getHttpServer())
        .post('/api/admin/social-link')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(201);

      expect(res.body.platform).toBe('LinkedIn');
      expect(mockAuditLogRepo.save).toHaveBeenCalled();
    });
  });
});

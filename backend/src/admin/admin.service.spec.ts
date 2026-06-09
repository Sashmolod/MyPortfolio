import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminService } from './admin.service';
import { Skill, Hero, Project, ContactMessage, SocialLink, Settings } from './entities';
import { NotFoundException } from '@nestjs/common';

describe('AdminService', () => {
  let service: AdminService;
  let skillRepo: Repository<Skill>;
  let projectRepo: Repository<Project>;
  let messageRepo: Repository<ContactMessage>;
  let heroRepo: Repository<Hero>;
  let socialLinkRepo: Repository<SocialLink>;
  let settingsRepo: Repository<Settings>;

  const mockSkill = { id: 1, name: 'React', level: 90, sortOrder: 1 } as any;
  const mockProject = { id: 1, title: 'Project A', description: 'Desc A', sortOrder: 1, technologies: ['React'] } as any;
  const mockMessage = { id: 1, name: 'User', email: 'user@example.com', subject: 'Hi', message: 'Hello world' } as any;
  const mockHero = { id: 1, name: 'John Doe', title: 'Dev', bio: 'Hello', avatar: 'avatar.png' } as any;
  const mockSocialLink = { id: 1, platform: 'GitHub', url: 'https://github.com', sortOrder: 1 } as any;
  const mockSettings = { id: 1, enableSounds: true } as any;

  const mockRepo = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn((dto) => dto),
    save: jest.fn(async (entity) => ({ id: 1, ...entity })),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    softDelete: jest.fn().mockResolvedValue({ affected: 1 }),
    restore: jest.fn().mockResolvedValue({ affected: 1 }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  });

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: getRepositoryToken(Skill), useValue: mockRepo() },
        { provide: getRepositoryToken(Project), useValue: mockRepo() },
        { provide: getRepositoryToken(ContactMessage), useValue: mockRepo() },
        { provide: getRepositoryToken(Hero), useValue: mockRepo() },
        { provide: getRepositoryToken(SocialLink), useValue: mockRepo() },
        { provide: getRepositoryToken(Settings), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    skillRepo = module.get<Repository<Skill>>(getRepositoryToken(Skill));
    projectRepo = module.get<Repository<Project>>(getRepositoryToken(Project));
    messageRepo = module.get<Repository<ContactMessage>>(getRepositoryToken(ContactMessage));
    heroRepo = module.get<Repository<Hero>>(getRepositoryToken(Hero));
    socialLinkRepo = module.get<Repository<SocialLink>>(getRepositoryToken(SocialLink));
    settingsRepo = module.get<Repository<Settings>>(getRepositoryToken(Settings));
  });

  describe('Skills CRUD', () => {
    it('should get all skills sorted by sortOrder', async () => {
      jest.spyOn(skillRepo, 'find').mockResolvedValue([mockSkill]);
      const result = await service.getAllSkills();
      expect(result).toEqual([mockSkill]);
      expect(skillRepo.find).toHaveBeenCalledWith({ order: { sortOrder: 'ASC' } });
    });

    it('should get a skill by id', async () => {
      jest.spyOn(skillRepo, 'findOne').mockResolvedValue(mockSkill);
      const result = await service.getSkill(1);
      expect(result).toEqual(mockSkill);
      expect(skillRepo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw error when getting non-existent skill', async () => {
      jest.spyOn(skillRepo, 'findOne').mockResolvedValue(null);
      await expect(service.getSkill(99)).rejects.toThrow('Skill not found');
    });

    it('should create a skill', async () => {
      const dto = { name: 'Vue', level: 80, sortOrder: 3 };
      const result = await service.createSkill(dto);
      expect(result).toEqual({ id: 1, ...dto });
      expect(skillRepo.create).toHaveBeenCalledWith(dto);
      expect(skillRepo.save).toHaveBeenCalled();
    });

    it('should update a skill', async () => {
      jest.spyOn(skillRepo, 'findOne').mockResolvedValue(mockSkill);
      const dto = { level: 95 };
      const result = await service.updateSkill(1, dto);
      expect(skillRepo.update).toHaveBeenCalledWith(1, dto);
      expect(result).toEqual(mockSkill);
    });

    it('should soft delete a skill', async () => {
      const result = await service.deleteSkill(1);
      expect(result).toEqual({ deleted: true });
      expect(skillRepo.softDelete).toHaveBeenCalledWith(1);
    });

    it('should restore a skill', async () => {
      jest.spyOn(skillRepo, 'findOne').mockResolvedValue(mockSkill);
      const result = await service.restoreSkill(1);
      expect(result).toEqual(mockSkill);
      expect(skillRepo.restore).toHaveBeenCalledWith(1);
    });

    it('should get deleted skills', async () => {
      jest.spyOn(skillRepo, 'find').mockResolvedValue([mockSkill]);
      const result = await service.getDeletedSkills();
      expect(result).toEqual([mockSkill]);
      expect(skillRepo.find).toHaveBeenCalledWith(expect.objectContaining({
        where: { deletedAt: expect.any(Object) },
        withDeleted: true,
      }));
    });

    it('should hard delete a skill', async () => {
      const result = await service.hardDeleteSkill(1);
      expect(result).toEqual({ permanentDeleted: true });
      expect(skillRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('Projects CRUD', () => {
    it('should get all projects sorted by sortOrder', async () => {
      jest.spyOn(projectRepo, 'find').mockResolvedValue([mockProject]);
      const result = await service.getAllProjects();
      expect(result).toEqual([mockProject]);
      expect(projectRepo.find).toHaveBeenCalledWith({ order: { sortOrder: 'ASC' } });
    });

    it('should get a project by id', async () => {
      jest.spyOn(projectRepo, 'findOne').mockResolvedValue(mockProject);
      const result = await service.getProject(1);
      expect(result).toEqual(mockProject);
    });

    it('should throw error when project not found', async () => {
      jest.spyOn(projectRepo, 'findOne').mockResolvedValue(null);
      await expect(service.getProject(99)).rejects.toThrow('Project not found');
    });

    it('should create project', async () => {
      const dto = { title: 'Project B', description: 'Desc B', sortOrder: 2, technologies: 'Node' };
      const result = await service.createProject(dto);
      expect(result).toEqual({ id: 1, ...dto });
    });

    it('should update project', async () => {
      jest.spyOn(projectRepo, 'findOne').mockResolvedValue(mockProject);
      const result = await service.updateProject(1, { title: 'New Title' });
      expect(projectRepo.update).toHaveBeenCalledWith(1, { title: 'New Title' });
      expect(result).toEqual(mockProject);
    });

    it('should soft delete a project', async () => {
      const result = await service.deleteProject(1);
      expect(result).toEqual({ deleted: true });
    });

    it('should restore a project', async () => {
      jest.spyOn(projectRepo, 'findOne').mockResolvedValue(mockProject);
      const result = await service.restoreProject(1);
      expect(projectRepo.restore).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockProject);
    });

    it('should get deleted projects', async () => {
      jest.spyOn(projectRepo, 'find').mockResolvedValue([mockProject]);
      const result = await service.getDeletedProjects();
      expect(result).toEqual([mockProject]);
    });

    it('should hard delete a project', async () => {
      const result = await service.hardDeleteProject(1);
      expect(result).toEqual({ permanentDeleted: true });
      expect(projectRepo.delete).toHaveBeenCalledWith(1);
    });
  });

  describe('Contact Messages CRUD', () => {
    it('should get all messages sorted by createdAt DESC', async () => {
      jest.spyOn(messageRepo, 'find').mockResolvedValue([mockMessage]);
      const result = await service.getAllMessages();
      expect(result).toEqual([mockMessage]);
      expect(messageRepo.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
    });

    it('should get message by id', async () => {
      jest.spyOn(messageRepo, 'findOne').mockResolvedValue(mockMessage);
      const result = await service.getMessage(1);
      expect(result).toEqual(mockMessage);
    });

    it('should throw error when message not found', async () => {
      jest.spyOn(messageRepo, 'findOne').mockResolvedValue(null);
      await expect(service.getMessage(99)).rejects.toThrow('Message not found');
    });

    it('should create message', async () => {
      const dto = { name: 'User', email: 'user@example.com', subject: 'Hi', message: 'Hello' };
      const result = await service.createMessage(dto);
      expect(result).toEqual({ id: 1, ...dto });
    });

    it('should delete message', async () => {
      const result = await service.deleteMessage(1);
      expect(result).toEqual({ deleted: true });
    });

    it('should restore message', async () => {
      jest.spyOn(messageRepo, 'findOne').mockResolvedValue(mockMessage);
      const result = await service.restoreMessage(1);
      expect(messageRepo.restore).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockMessage);
    });

    it('should get deleted messages', async () => {
      jest.spyOn(messageRepo, 'find').mockResolvedValue([mockMessage]);
      const result = await service.getDeletedMessages();
      expect(result).toEqual([mockMessage]);
    });

    it('should hard delete message', async () => {
      const result = await service.hardDeleteMessage(1);
      expect(result).toEqual({ permanentDeleted: true });
    });
  });

  describe('Hero CRUD', () => {
    it('should get all heroes', async () => {
      jest.spyOn(heroRepo, 'find').mockResolvedValue([mockHero]);
      const result = await service.getAllHeroes();
      expect(result).toEqual([mockHero]);
    });

    it('should get hero by id', async () => {
      jest.spyOn(heroRepo, 'findOne').mockResolvedValue(mockHero);
      const result = await service.getHero(1);
      expect(result).toEqual(mockHero);
    });

    it('should throw error when hero not found', async () => {
      jest.spyOn(heroRepo, 'findOne').mockResolvedValue(null);
      await expect(service.getHero(99)).rejects.toThrow('Hero not found');
    });

    it('should create hero', async () => {
      const dto = { name: 'Bob', title: 'Dev', bio: 'Hi', avatar: 'bob.png' };
      const result = await service.createHero(dto);
      expect(result).toEqual({ id: 1, ...dto });
    });

    it('should update hero and throw NotFoundException if hero does not exist', async () => {
      jest.spyOn(heroRepo, 'findOne').mockResolvedValue(null);
      await expect(service.updateHero(99, { name: 'New' })).rejects.toThrow(NotFoundException);
    });

    it('should update hero successfully', async () => {
      jest.spyOn(heroRepo, 'findOne').mockResolvedValue(mockHero);
      jest.spyOn(heroRepo, 'save').mockResolvedValue({ ...mockHero, name: 'NewName' } as any);
      const result = await service.updateHero(1, { name: 'NewName' });
      expect(result.name).toBe('NewName');
    });

    it('should soft delete hero', async () => {
      const result = await service.deleteHero(1);
      expect(result).toEqual({ deleted: true });
    });

    it('should restore hero', async () => {
      jest.spyOn(heroRepo, 'findOne').mockResolvedValue(mockHero);
      const result = await service.restoreHero(1);
      expect(heroRepo.restore).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockHero);
    });

    it('should get deleted heroes', async () => {
      jest.spyOn(heroRepo, 'find').mockResolvedValue([mockHero]);
      const result = await service.getDeletedHeroes();
      expect(result).toEqual([mockHero]);
    });

    it('should hard delete hero', async () => {
      const result = await service.hardDeleteHero(1);
      expect(result).toEqual({ permanentDeleted: true });
    });
  });

  describe('Social Links CRUD', () => {
    it('should get all social links sorted by sortOrder', async () => {
      jest.spyOn(socialLinkRepo, 'find').mockResolvedValue([mockSocialLink]);
      const result = await service.getAllSocialLinks();
      expect(result).toEqual([mockSocialLink]);
      expect(socialLinkRepo.find).toHaveBeenCalledWith({ order: { sortOrder: 'ASC' } });
    });

    it('should get social link by id', async () => {
      jest.spyOn(socialLinkRepo, 'findOne').mockResolvedValue(mockSocialLink);
      const result = await service.getSocialLink(1);
      expect(result).toEqual(mockSocialLink);
    });

    it('should throw error when social link not found', async () => {
      jest.spyOn(socialLinkRepo, 'findOne').mockResolvedValue(null);
      await expect(service.getSocialLink(99)).rejects.toThrow('Social link not found');
    });

    it('should create social link', async () => {
      const dto = { platform: 'LinkedIn', url: 'https://linkedin.com', sortOrder: 2 };
      const result = await service.createSocialLink(dto);
      expect(result).toEqual({ id: 1, ...dto });
    });

    it('should update social link', async () => {
      jest.spyOn(socialLinkRepo, 'findOne').mockResolvedValue(mockSocialLink);
      const result = await service.updateSocialLink(1, { url: 'https://github.com/new' });
      expect(socialLinkRepo.update).toHaveBeenCalledWith(1, { url: 'https://github.com/new' });
      expect(result).toEqual(mockSocialLink);
    });

    it('should soft delete social link', async () => {
      const result = await service.deleteSocialLink(1);
      expect(result).toEqual({ deleted: true });
    });

    it('should restore social link', async () => {
      jest.spyOn(socialLinkRepo, 'findOne').mockResolvedValue(mockSocialLink);
      const result = await service.restoreSocialLink(1);
      expect(socialLinkRepo.restore).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSocialLink);
    });

    it('should get deleted social links', async () => {
      jest.spyOn(socialLinkRepo, 'find').mockResolvedValue([mockSocialLink]);
      const result = await service.getDeletedSocialLinks();
      expect(result).toEqual([mockSocialLink]);
    });

    it('should hard delete social link', async () => {
      const result = await service.hardDeleteSocialLink(1);
      expect(result).toEqual({ permanentDeleted: true });
    });
  });

  describe('Settings CRUD', () => {
    it('should find existing settings', async () => {
      jest.spyOn(settingsRepo, 'findOne').mockResolvedValue(mockSettings);
      const result = await service.getSettings();
      expect(result).toEqual(mockSettings);
    });

    it('should create settings if not found', async () => {
      jest.spyOn(settingsRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(settingsRepo, 'save').mockResolvedValue(mockSettings);
      const result = await service.getSettings();
      expect(settingsRepo.create).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual({ id: 1 });
    });

    it('should update settings', async () => {
      jest.spyOn(settingsRepo, 'findOne').mockResolvedValue(mockSettings);
      const result = await service.updateSettings({ enableSounds: false });
      expect(settingsRepo.update).toHaveBeenCalledWith(1, { enableSounds: false });
      expect(result).toEqual(mockSettings);
    });
  });
});

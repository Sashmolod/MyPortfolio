import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AuditLog } from '../shared/entities';

describe('AdminController', () => {
  let controller: AdminController;
  let service: AdminService;

  const mockAdminService = {
    getAllSkills: jest.fn(),
    getSkill: jest.fn(),
    createSkill: jest.fn(),
    updateSkill: jest.fn(),
    deleteSkill: jest.fn(),
    getDeletedSkills: jest.fn(),
    restoreSkill: jest.fn(),
    hardDeleteSkill: jest.fn(),

    getAllProjects: jest.fn(),
    getProject: jest.fn(),
    createProject: jest.fn(),
    updateProject: jest.fn(),
    deleteProject: jest.fn(),
    getDeletedProjects: jest.fn(),
    restoreProject: jest.fn(),
    hardDeleteProject: jest.fn(),

    getAllHeroes: jest.fn(),
    getHero: jest.fn(),
    createHero: jest.fn(),
    updateHero: jest.fn(),
    deleteHero: jest.fn(),
    getDeletedHeroes: jest.fn(),
    restoreHero: jest.fn(),
    hardDeleteHero: jest.fn(),

    getAllMessages: jest.fn(),
    getMessage: jest.fn(),
    createMessage: jest.fn(),
    deleteMessage: jest.fn(),
    getDeletedMessages: jest.fn(),
    restoreMessage: jest.fn(),
    hardDeleteMessage: jest.fn(),

    getAllSocialLinks: jest.fn(),
    getSocialLink: jest.fn(),
    createSocialLink: jest.fn(),
    updateSocialLink: jest.fn(),
    deleteSocialLink: jest.fn(),
    getDeletedSocialLinks: jest.fn(),
    restoreSocialLink: jest.fn(),
    hardDeleteSocialLink: jest.fn(),

    getSettings: jest.fn(),
    updateSettings: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const mockAuditLogRepo = {
      create: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        { provide: getRepositoryToken(AuditLog), useValue: mockAuditLogRepo },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
    service = module.get<AdminService>(AdminService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Skills CRUD', () => {
    it('should get all skills', async () => {
      mockAdminService.getAllSkills.mockResolvedValue([]);
      await controller.getAllSkills();
      expect(mockAdminService.getAllSkills).toHaveBeenCalled();
    });

    it('should get skill by ID', async () => {
      mockAdminService.getSkill.mockResolvedValue({});
      await controller.getSkill(1);
      expect(mockAdminService.getSkill).toHaveBeenCalledWith(1);
    });

    it('should create skill', async () => {
      const dto = { name: 'TS', level: 90, sortOrder: 0 };
      mockAdminService.createSkill.mockResolvedValue(dto);
      await controller.createSkill(dto);
      expect(mockAdminService.createSkill).toHaveBeenCalledWith(dto);
    });

    it('should update skill', async () => {
      const dto = { name: 'JS' };
      mockAdminService.updateSkill.mockResolvedValue(dto);
      await controller.updateSkill(1, dto);
      expect(mockAdminService.updateSkill).toHaveBeenCalledWith(1, dto);
    });

    it('should soft delete skill', async () => {
      mockAdminService.deleteSkill.mockResolvedValue(undefined);
      await controller.deleteSkill(1);
      expect(mockAdminService.deleteSkill).toHaveBeenCalledWith(1);
    });

    it('should get deleted skills', async () => {
      mockAdminService.getDeletedSkills.mockResolvedValue([]);
      await controller.getDeletedSkills();
      expect(mockAdminService.getDeletedSkills).toHaveBeenCalled();
    });

    it('should restore skill', async () => {
      mockAdminService.restoreSkill.mockResolvedValue({});
      await controller.restoreSkill(1);
      expect(mockAdminService.restoreSkill).toHaveBeenCalledWith(1);
    });

    it('should hard delete skill', async () => {
      mockAdminService.hardDeleteSkill.mockResolvedValue(undefined);
      await controller.hardDeleteSkill(1);
      expect(mockAdminService.hardDeleteSkill).toHaveBeenCalledWith(1);
    });
  });

  describe('Projects CRUD', () => {
    it('should get all projects', async () => {
      mockAdminService.getAllProjects.mockResolvedValue([]);
      await controller.getAllProjects();
      expect(mockAdminService.getAllProjects).toHaveBeenCalled();
    });

    it('should get project by ID', async () => {
      mockAdminService.getProject.mockResolvedValue({});
      await controller.getProject(1);
      expect(mockAdminService.getProject).toHaveBeenCalledWith(1);
    });

    it('should create project', async () => {
      const dto = { title: 'Site', description: 'Desc', technologies: 'Nest' };
      mockAdminService.createProject.mockResolvedValue(dto);
      await controller.createProject(dto);
      expect(mockAdminService.createProject).toHaveBeenCalledWith(dto);
    });

    it('should update project', async () => {
      const dto = { title: 'New Site' };
      mockAdminService.updateProject.mockResolvedValue(dto);
      await controller.updateProject(1, dto);
      expect(mockAdminService.updateProject).toHaveBeenCalledWith(1, dto);
    });

    it('should soft delete project', async () => {
      await controller.deleteProject(1);
      expect(mockAdminService.deleteProject).toHaveBeenCalledWith(1);
    });

    it('should restore project', async () => {
      await controller.restoreProject(1);
      expect(mockAdminService.restoreProject).toHaveBeenCalledWith(1);
    });

    it('should hard delete project', async () => {
      await controller.hardDeleteProject(1);
      expect(mockAdminService.hardDeleteProject).toHaveBeenCalledWith(1);
    });

    it('should get deleted projects', async () => {
      await controller.getDeletedProjects();
      expect(mockAdminService.getDeletedProjects).toHaveBeenCalled();
    });
  });

  describe('Hero CRUD', () => {
    it('should get all heroes', async () => {
      await controller.getAllHeroes();
      expect(mockAdminService.getAllHeroes).toHaveBeenCalled();
    });

    it('should get hero by ID', async () => {
      await controller.getHero(1);
      expect(mockAdminService.getHero).toHaveBeenCalledWith(1);
    });

    it('should create hero', async () => {
      const dto = { name: 'Jane', title: 'Developer', bio: 'Bio' };
      await controller.createHero(dto);
      expect(mockAdminService.createHero).toHaveBeenCalledWith(dto);
    });

    it('should update hero', async () => {
      const dto = { name: 'Val' };
      await controller.updateHero(1, dto);
      expect(mockAdminService.updateHero).toHaveBeenCalledWith(1, dto);
    });

    it('should delete hero', async () => {
      await controller.deleteHero(1);
      expect(mockAdminService.deleteHero).toHaveBeenCalledWith(1);
    });

    it('should restore hero', async () => {
      await controller.restoreHero(1);
      expect(mockAdminService.restoreHero).toHaveBeenCalledWith(1);
    });

    it('should hard delete hero', async () => {
      await controller.hardDeleteHero(1);
      expect(mockAdminService.hardDeleteHero).toHaveBeenCalledWith(1);
    });

    it('should get deleted heroes', async () => {
      await controller.getDeletedHeroes();
      expect(mockAdminService.getDeletedHeroes).toHaveBeenCalled();
    });
  });

  describe('Messages CRUD', () => {
    it('should get all messages', async () => {
      await controller.getAllMessages();
      expect(mockAdminService.getAllMessages).toHaveBeenCalled();
    });

    it('should get message by ID', async () => {
      await controller.getMessage(1);
      expect(mockAdminService.getMessage).toHaveBeenCalledWith(1);
    });

    it('should create message', async () => {
      const dto = { name: 'Bob', email: 'bob@gmail.com', subject: 'Topic', message: 'Hello there', captchaAnswer: '12', captchaToken: 'dummy' };
      await controller.createMessage(dto);
      expect(mockAdminService.createMessage).toHaveBeenCalledWith(dto);
    });

    it('should delete message', async () => {
      await controller.deleteMessage(1);
      expect(mockAdminService.deleteMessage).toHaveBeenCalledWith(1);
    });

    it('should restore message', async () => {
      await controller.restoreMessage(1);
      expect(mockAdminService.restoreMessage).toHaveBeenCalledWith(1);
    });

    it('should hard delete message', async () => {
      await controller.hardDeleteMessage(1);
      expect(mockAdminService.hardDeleteMessage).toHaveBeenCalledWith(1);
    });

    it('should get deleted messages', async () => {
      await controller.getDeletedMessages();
      expect(mockAdminService.getDeletedMessages).toHaveBeenCalled();
    });
  });

  describe('Social Links CRUD', () => {
    it('should get all social links', async () => {
      await controller.getAllSocialLinks();
      expect(mockAdminService.getAllSocialLinks).toHaveBeenCalled();
    });

    it('should get social link by ID', async () => {
      await controller.getSocialLink(1);
      expect(mockAdminService.getSocialLink).toHaveBeenCalledWith(1);
    });

    it('should create social link', async () => {
      const dto = { platform: 'Twitter', url: 'https://tw.com', sortOrder: 1 };
      await controller.createSocialLink(dto);
      expect(mockAdminService.createSocialLink).toHaveBeenCalledWith(dto);
    });

    it('should update social link', async () => {
      const dto = { url: 'https://newtw.com' };
      await controller.updateSocialLink(1, dto);
      expect(mockAdminService.updateSocialLink).toHaveBeenCalledWith(1, dto);
    });

    it('should delete social link', async () => {
      await controller.deleteSocialLink(1);
      expect(mockAdminService.deleteSocialLink).toHaveBeenCalledWith(1);
    });

    it('should restore social link', async () => {
      await controller.restoreSocialLink(1);
      expect(mockAdminService.restoreSocialLink).toHaveBeenCalledWith(1);
    });

    it('should hard delete social link', async () => {
      await controller.hardDeleteSocialLink(1);
      expect(mockAdminService.hardDeleteSocialLink).toHaveBeenCalledWith(1);
    });

    it('should get deleted social links', async () => {
      await controller.getDeletedSocialLinks();
      expect(mockAdminService.getDeletedSocialLinks).toHaveBeenCalled();
    });
  });

  describe('Settings operations', () => {
    it('should get settings', async () => {
      await controller.getSettings();
      expect(mockAdminService.getSettings).toHaveBeenCalled();
    });

    it('should update settings', async () => {
      const dto = { enableDoodly: false };
      await controller.updateSettings(dto);
      expect(mockAdminService.updateSettings).toHaveBeenCalledWith(dto);
    });
  });
});

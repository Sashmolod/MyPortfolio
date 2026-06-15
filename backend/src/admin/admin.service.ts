import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull, In } from 'typeorm';

import { Skill, Project, ContactMessage, Hero, SocialLink, Settings, SkillCategory } from '../shared/entities';
import {
  CreateSkillDto,
  CreateProjectDto,
  CreateContactMessageDto,
  CreateHeroDto,
  CreateSocialLinkDto,
  UpdateSkillDto,
  UpdateProjectDto,
  UpdateHeroDto,
  UpdateSocialLinkDto,
} from '../shared/dto';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(ContactMessage)
    private messageRepo: Repository<ContactMessage>,
    @InjectRepository(Hero)
    private heroRepo: Repository<Hero>,
    @InjectRepository(SocialLink)
    private socialLinkRepo: Repository<SocialLink>,
    @InjectRepository(Settings)
    private settingsRepo: Repository<Settings>,
  ) {}

  // Skills CRUD
  async getAllSkills(): Promise<any[]> {
    const skills = await this.skillRepo.find({ 
      order: { sortOrder: 'ASC' },
      relations: { 
        category: true,
        subcategory: true 
      } 
    });
    // Map category/subcategory names for frontend display
    return skills.map(skill => ({
      ...skill,
      category: skill.category?.name || null,
      subcategory: skill.subcategory?.name || null,
    }));
  }

  async getSkill(id: number) {
    const skill = await this.skillRepo.findOne({ where: { id } });
    if (!skill) throw new NotFoundException('Skill not found');
    return skill;
  }

  async createSkill(dto: CreateSkillDto) {
    const skill = this.skillRepo.create(dto);
    return this.skillRepo.save(skill);
  }

  async updateSkill(id: number, dto: UpdateSkillDto) {
    await this.skillRepo.update(id, dto);
    return this.getSkill(id);
  }

  async deleteSkill(id: number) {
    await this.skillRepo.softDelete(id);
    return { deleted: true };
  }

  async restoreSkill(id: number) {
    await this.skillRepo.restore(id);
    return this.getSkill(id);
  }

  async getDeletedSkills(): Promise<any[]> {
    const skills = await this.skillRepo.find({
      where: { deletedAt: Not(IsNull()) },
      withDeleted: true,
      order: { sortOrder: 'ASC' },
      relations: { 
        category: true,
        subcategory: true 
      }
    });
    return skills.map(skill => ({
      ...skill,
      category: skill.category?.name || null,
      subcategory: skill.subcategory?.name || null,
    }));
  }

  // Projects CRUD
  async getAllProjects() {
    return this.projectRepo.find({ 
      order: { sortOrder: 'ASC' },
      relations: { skills: true }
    });
  }

  async getProject(id: number) {
    const project = await this.projectRepo.findOne({ 
      where: { id },
      relations: { skills: true }
    });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async createProject(dto: CreateProjectDto) {
    const { skillIds, ...projectData } = dto;
    const project = this.projectRepo.create(projectData);
    
    if (skillIds && skillIds.length > 0) {
      const skills = await this.skillRepo.findBy({ id: In(skillIds) });
      project.skills = skills;
    }
    
    return this.projectRepo.save(project);
  }

  async updateProject(id: number, dto: UpdateProjectDto) {
    const { skillIds, ...projectData } = dto;
    
    const project = await this.projectRepo.findOne({
      where: { id },
      relations: { skills: true },
    });
    if (!project) throw new NotFoundException('Project not found');
    
    if (projectData.title !== undefined) project.title = projectData.title;
    if (projectData.description !== undefined) project.description = projectData.description;
    if (projectData.image !== undefined) project.image = projectData.image;
    if (projectData.link !== undefined) project.link = projectData.link;
    if (projectData.sortOrder !== undefined) project.sortOrder = projectData.sortOrder;
    
    if (skillIds !== undefined) {
      if (skillIds.length > 0) {
        project.skills = await this.skillRepo.findBy({ id: In(skillIds) });
      } else {
        project.skills = [];
      }
    }
    
    return this.projectRepo.save(project);
  }

  async deleteProject(id: number) {
    await this.projectRepo.softDelete(id);
    return { deleted: true };
  }

  async restoreProject(id: number) {
    await this.projectRepo.restore(id);
    return this.getProject(id);
  }

  async getDeletedProjects() {
    return this.projectRepo.find({
      where: { deletedAt: Not(IsNull()) },
      withDeleted: true,
      order: { sortOrder: 'ASC' },
    });
  }

  // Contact Messages CRUD
  async getAllMessages() {
    return this.messageRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getMessage(id: number) {
    const message = await this.messageRepo.findOne({ where: { id } });
    if (!message) throw new NotFoundException('Message not found');
    return message;
  }

  async createMessage(dto: CreateContactMessageDto) {
    const message = this.messageRepo.create(dto);
    return this.messageRepo.save(message);
  }

  async deleteMessage(id: number) {
    await this.messageRepo.softDelete(id);
    return { deleted: true };
  }

  async restoreMessage(id: number) {
    await this.messageRepo.restore(id);
    return this.getMessage(id);
  }

  async getDeletedMessages() {
    return this.messageRepo.find({
      where: { deletedAt: Not(IsNull()) },
      withDeleted: true,
      order: { createdAt: 'DESC' },
    });
  }

  // Hero CRUD — всегда только ОДИН hero в БД
  private async softDeleteAllHeroes(): Promise<void> {
    // Soft-delete все hero, которые не помечены как удалённые
    await this.heroRepo.update(
      { deletedAt: IsNull() },
      { deletedAt: new Date() }
    );
  }

  async getAllHeroes() {
    return this.heroRepo.find({ 
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' } 
    });
  }

  async getHero(id: number) {
    const hero = await this.heroRepo.findOne({ where: { id, deletedAt: IsNull() } });
    if (!hero) throw new NotFoundException('Hero not found');
    return hero;
  }

  async createHero(dto: CreateHeroDto) {
    // Удаляем все существующие hero перед созданием нового
    await this.softDeleteAllHeroes();
    const hero = this.heroRepo.create(dto);
    return this.heroRepo.save(hero);
  }

  async updateHero(id: number, dto: UpdateHeroDto) {
    // Находим hero по id (или единственную существующую)
    let hero = await this.heroRepo.findOne({ where: { id, deletedAt: IsNull() } });
    
    if (!hero) {
      // Пробуем найти по любому id (для обратной совместимости)
      hero = await this.heroRepo.findOne({ where: { deletedAt: IsNull() } });
    }
    
    if (!hero) {
      // Нет hero — создаём новый
      await this.softDeleteAllHeroes();
      hero = this.heroRepo.create(dto);
      return this.heroRepo.save(hero);
    }

    if (dto.name !== undefined) hero.name = dto.name;
    if (dto.title !== undefined) hero.title = dto.title;
    if (dto.bio !== undefined) hero.bio = dto.bio;
    if (dto.avatar !== undefined) hero.avatar = dto.avatar;
    
    return this.heroRepo.save(hero);
  }

  async deleteHero(id: number) {
    // Нельзя удалить единственного hero — вместо этого создаём дефолтный
    const count = await this.heroRepo.count({ where: { deletedAt: IsNull() } });
    if (count <= 1) {
      throw new BadRequestException('Нельзя удалить единственного hero. Сначала создайте новый.');
    }
    await this.heroRepo.softDelete(id);
    return { deleted: true };
  }

  async restoreHero(id: number) {
    await this.heroRepo.restore(id);
    return this.getHero(id);
  }

  async getDeletedHeroes() {
    return this.heroRepo.find({
      where: { deletedAt: Not(IsNull()) },
      withDeleted: true,
      order: { createdAt: 'DESC' },
    });
  }

  // Social Links CRUD
  async getAllSocialLinks() {
    return this.socialLinkRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async getSocialLink(id: number) {
    const link = await this.socialLinkRepo.findOne({ where: { id } });
    if (!link) throw new NotFoundException('Social link not found');
    return link;
  }

  async createSocialLink(dto: CreateSocialLinkDto) {
    const link = this.socialLinkRepo.create(dto);
    return this.socialLinkRepo.save(link);
  }

  async updateSocialLink(id: number, dto: UpdateSocialLinkDto) {
    await this.socialLinkRepo.update(id, dto);
    return this.getSocialLink(id);
  }

  async deleteSocialLink(id: number) {
    await this.socialLinkRepo.softDelete(id);
    return { deleted: true };
  }

  async restoreSocialLink(id: number) {
    await this.socialLinkRepo.restore(id);
    return this.getSocialLink(id);
  }

  async getDeletedSocialLinks() {
    return this.socialLinkRepo.find({
      where: { deletedAt: Not(IsNull()) },
      withDeleted: true,
      order: { sortOrder: 'ASC' },
    });
  }

  // Settings Management
  async getSettings() {
    let settings = await this.settingsRepo.findOne({ where: { id: 1 } });
    if (!settings) {
      settings = this.settingsRepo.create({ id: 1 });
      await this.settingsRepo.save(settings);
    }
    return settings;
  }

  async updateSettings(dto: Partial<Settings>) {
    await this.getSettings(); // Ensure settings row 1 exists
    await this.settingsRepo.update(1, dto);
    return this.getSettings();
  }

  // Hard Delete methods (permanent deletion)
  async hardDeleteSkill(id: number) {
    await this.skillRepo.delete(id);
    return { permanentDeleted: true };
  }

  async hardDeleteProject(id: number) {
    await this.projectRepo.delete(id);
    return { permanentDeleted: true };
  }

  async hardDeleteMessage(id: number) {
    await this.messageRepo.delete(id);
    return { permanentDeleted: true };
  }

  async hardDeleteHero(id: number) {
    await this.heroRepo.delete(id);
    return { permanentDeleted: true };
  }

  async hardDeleteSocialLink(id: number) {
    await this.socialLinkRepo.delete(id);
    return { permanentDeleted: true };
  }
}

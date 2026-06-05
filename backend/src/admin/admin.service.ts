import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, IsNull } from 'typeorm';

import { Skill } from './entities/skill.entity';
import { Project } from './entities/project.entity';
import { ContactMessage } from './entities/contact-message.entity';
import { Hero } from './entities/hero.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { CreateHeroDto } from './dto/create-hero.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateHeroDto } from './dto/update-hero.dto';

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
  ) {}

  // Skills CRUD
  async getAllSkills() {
    return this.skillRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async getSkill(id: number) {
    const skill = await this.skillRepo.findOne({ where: { id } });
    if (!skill) throw new Error('Skill not found');
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

  async getDeletedSkills() {
    return this.skillRepo.find({
      where: { deletedAt: Not(IsNull()) },
      withDeleted: true,
      order: { sortOrder: 'ASC' },
    });
  }

  // Projects CRUD
  async getAllProjects() {
    return this.projectRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async getProject(id: number) {
    const project = await this.projectRepo.findOne({ where: { id } });
    if (!project) throw new Error('Project not found');
    return project;
  }

  async createProject(dto: CreateProjectDto) {
    const project = this.projectRepo.create(dto);
    return this.projectRepo.save(project);
  }

  async updateProject(id: number, dto: UpdateProjectDto) {
    await this.projectRepo.update(id, dto);
    return this.getProject(id);
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
    if (!message) throw new Error('Message not found');
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

  // Hero CRUD
  async getAllHeroes() {
    return this.heroRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getHero(id: number) {
    const hero = await this.heroRepo.findOne({ where: { id } });
    if (!hero) throw new Error('Hero not found');
    return hero;
  }

  async createHero(dto: CreateHeroDto) {
    const hero = this.heroRepo.create(dto);
    // Convert socialLinks object to JSON string if needed
    if (dto.socialLinks && typeof dto.socialLinks === 'object') {
      hero.socialLinks = JSON.stringify(dto.socialLinks);
    }
    return this.heroRepo.save(hero);
  }

  async updateHero(id: number, dto: UpdateHeroDto) {
    const hero = await this.heroRepo.findOne({ where: { id } });
    if (!hero) throw new NotFoundException(`Hero with id ${id} not found`);

    Object.assign(hero, dto);

    // Нормализуем socialLinks: всегда храним как JSON-строку
    if (dto.socialLinks !== undefined) {
      if (typeof dto.socialLinks === 'object') {
        hero.socialLinks = JSON.stringify(dto.socialLinks);
      } else if (typeof dto.socialLinks === 'string') {
        // Валидируем что это корректный JSON, иначе сбрасываем
        try { JSON.parse(dto.socialLinks); hero.socialLinks = dto.socialLinks; }
        catch { hero.socialLinks = '{}'; }
      }
    }

    return this.heroRepo.save(hero);
  }

  async deleteHero(id: number) {
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
}

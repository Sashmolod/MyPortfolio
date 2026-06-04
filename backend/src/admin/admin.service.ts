import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill } from './entities/skill.entity';
import { Project } from './entities/project.entity';
import { ContactMessage } from './entities/contact-message.entity';
import { Hero } from './entities/hero.entity';
import { CreateSkillDto, CreateProjectDto, CreateContactMessageDto, CreateHeroDto } from './dto/create.dto';

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

  async updateSkill(id: number, dto: CreateSkillDto) {
    await this.skillRepo.update(id, dto);
    return this.getSkill(id);
  }

  async deleteSkill(id: number) {
    await this.skillRepo.delete(id);
    return { deleted: true };
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

  async updateProject(id: number, dto: CreateProjectDto) {
    await this.projectRepo.update(id, dto);
    return this.getProject(id);
  }

  async deleteProject(id: number) {
    await this.projectRepo.delete(id);
    return { deleted: true };
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
    await this.messageRepo.delete(id);
    return { deleted: true };
  }

  // Hero CRUD
  async getAllHeroes() {
    return this.heroRepo.find({ order: { createdAt: 'DESC' } });
  }

  async getHero(id: number) {
    const hero = await this.heroRepo.findOne({ where: { id } });
    if (!hero) throw new Error('Hero not found');
    return {
      ...hero,
      socialLinks: typeof hero.socialLinks === 'string' ? JSON.parse(hero.socialLinks) : hero.socialLinks,
    };
  }

  async createHero(dto: CreateHeroDto) {
    const hero = this.heroRepo.create({
      ...dto,
      socialLinks: dto.socialLinks ? JSON.stringify(dto.socialLinks) : '{}',
    });
    return this.heroRepo.save(hero);
  }

  async updateHero(id: number, dto: CreateHeroDto) {
    const hero = await this.heroRepo.findOne({ where: { id } });
    if (!hero) throw new Error('Hero not found');
    Object.assign(hero, dto);
    if (dto.socialLinks) {
      hero.socialLinks = JSON.stringify(dto.socialLinks);
    }
    const saved = await this.heroRepo.save(hero);
    return {
      ...saved,
      socialLinks: typeof saved.socialLinks === 'string' ? JSON.parse(saved.socialLinks) : saved.socialLinks,
    };
  }

  async deleteHero(id: number) {
    await this.heroRepo.delete(id);
    return { deleted: true };
  }
}

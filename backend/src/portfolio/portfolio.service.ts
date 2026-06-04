import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill, Hero, Project, ContactMessage } from '../admin/entities';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,
    @InjectRepository(Hero)
    private heroRepo: Repository<Hero>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(ContactMessage)
    private messageRepo: Repository<ContactMessage>,
  ) {}

  async getAllSkills() {
    return this.skillRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async getAllProjects() {
    return this.projectRepo.find({ order: { sortOrder: 'ASC' } });
  }

  // ====== HERO CRUD ======

  async getHeroData() {
    const heroes = await this.heroRepo.find({
      take: 1,
    });
    const hero = heroes[0];
    if (hero) {
      return {
        id: hero.id,
        name: hero.name,
        title: hero.title,
        bio: hero.bio,
        avatar: hero.avatar,
        socialLinks: hero.getSocialLinks(),
      };
    }
    // Дефолтные данные если нет записи в БД
    return {
      name: 'John Doe',
      title: 'Full Stack Developer',
      bio: 'Passionate developer creating amazing web experiences.',
      avatar: '/favicon.svg',
      socialLinks: { github: '#', linkedin: '#', twitter: '#' },
    };
  }

  async createHero(data: Partial<Hero>) {
    const hero = this.heroRepo.create({
      ...data,
      socialLinks: data.socialLinks ? JSON.stringify(data.socialLinks) : '{}',
    });
    const saved = await this.heroRepo.save(hero);
    return {
      id: saved.id,
      name: saved.name,
      title: saved.title,
      bio: saved.bio,
      avatar: saved.avatar,
      socialLinks: saved.getSocialLinks(),
    };
  }

  async updateHero(id: number, data: Partial<Hero>) {
    const hero = await this.heroRepo.findOne({ where: { id } });
    if (!hero) throw new NotFoundException(`Hero with id ${id} not found`);
    Object.assign(hero, data);
    if (data.socialLinks) {
      hero.socialLinks = JSON.stringify(data.socialLinks);
    }
    const saved = await this.heroRepo.save(hero);
    return {
      id: saved.id,
      name: saved.name,
      title: saved.title,
      bio: saved.bio,
      avatar: saved.avatar,
      socialLinks: saved.getSocialLinks(),
    };
  }

  async deleteHero(id: number) {
    const hero = await this.heroRepo.findOne({ where: { id } });
    if (!hero) throw new NotFoundException(`Hero with id ${id} not found`);
    await this.heroRepo.delete(id);
    return { message: 'Hero data deleted' };
  }

  async getContactInfo() {
    return {
      email: 'john@example.com',
      phone: '+1 234 567 890',
      address: 'Kyiv, Ukraine',
    };
  }

  async getAllMessages() {
    return this.messageRepo.find({ order: { createdAt: 'DESC' } });
  }

  async createMessage(dto: Partial<ContactMessage>) {
    const message = this.messageRepo.create(dto);
    return this.messageRepo.save(message);
  }
}
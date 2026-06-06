import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Skill, Hero, Project, ContactMessage, SocialLink } from '../admin/entities';

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
    @InjectRepository(SocialLink)
    private socialLinkRepo: Repository<SocialLink>,
  ) {}

  async getAllSkills() {
    return this.skillRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async getAllProjects() {
    return this.projectRepo.find({ order: { sortOrder: 'ASC' } });
  }

  // ====== HERO CRUD ======

  async getHeroData() {
    const heroes = await this.heroRepo.find({ take: 1 });
    const hero = heroes[0];
    const socialLinks = await this.socialLinkRepo.find({ order: { sortOrder: 'ASC' } });
    if (hero) {
      return {
        id: hero.id,
        name: hero.name,
        title: hero.title,
        bio: hero.bio,
        avatar: hero.avatar,
        socialLinks,
      };
    }
    // Дефолтные данные если нет записи в БД
    return {
      name: 'John Doe',
      title: 'Full Stack Developer',
      bio: 'I build things for the web and beyond.',
      avatar: null,
      socialLinks: [
        { platform: 'GitHub', url: 'https://github.com/yourusername' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/yourusername' },
        { platform: 'Twitter', url: 'https://twitter.com/yourusername' },
      ],
    };
  }

  async getContactInfo() {
    return {
      email: 'john@example.com',
      phone: '+1 234 567 890',
      address: 'Kyiv, Ukraine',
    };
  }

  async createMessage(dto: Partial<ContactMessage>) {
    const message = this.messageRepo.create(dto);
    return this.messageRepo.save(message);
  }
}
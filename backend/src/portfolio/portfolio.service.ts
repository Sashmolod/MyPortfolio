import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Skill, Hero, Project, ContactMessage, SocialLink, Settings, SkillCategory } from '../shared/entities';
import { CreateContactMessageDto } from '../shared/dto';
import { CaptchaService } from './services/captcha.service';
import {
  DEFAULT_HERO,
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_CONTACT_INFO,
} from './config/portfolio-defaults.config';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,
    @InjectRepository(SkillCategory)
    private skillCategoryRepo: Repository<SkillCategory>,
    @InjectRepository(Hero)
    private heroRepo: Repository<Hero>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    @InjectRepository(ContactMessage)
    private messageRepo: Repository<ContactMessage>,
    @InjectRepository(SocialLink)
    private socialLinkRepo: Repository<SocialLink>,
    @InjectRepository(Settings)
    private settingsRepo: Repository<Settings>,
    private configService: ConfigService,
    private captchaService: CaptchaService,
  ) {}

  async getAllSkills() {
    return this.skillRepo.find({ order: { sortOrder: 'ASC' } });
  }

  async getAllSkillCategories() {
    // Загружаем корневые категории с подкатегориями (без навыков)
    const categories = await this.skillCategoryRepo.find({
      order: { sortOrder: 'ASC' },
      where: { parentId: null } as any,
      relations: {
        subcategories: true,
      },
    });

    // Загружаем все навыки
    const allSkills = await this.skillRepo.find({
      order: { sortOrder: 'ASC' },
    });

    // Формируем ответ: распределяем навыки по категориям и подкатегориям
    return categories.map((cat) => {
      // Навыки категории (categoryId = cat.id AND subcategoryId IS NULL)
      const categorySkills = allSkills.filter(
        (s) => s.categoryId === cat.id && (s.subcategoryId === null || s.subcategoryId === undefined)
      );

      // Подкатегории с навыками
      const subcategories = (cat.subcategories || []).map((sub) => {
        const subSkills = allSkills.filter(
          (s) => s.subcategoryId === sub.id
        );
        return {
          ...sub,
          skills: subSkills,
        };
      });

      return {
        ...cat,
        skills: categorySkills,
        subcategories,
      };
    });
  }

  async getAllSkillSubcategories() {
    return this.skillCategoryRepo.find({
      order: { sortOrder: 'ASC' },
      where: { parentId: Not(null) },
    });
  }

  async getAllProjects() {
    return this.projectRepo.find({ 
      order: { sortOrder: 'ASC' },
      relations: { skills: true }
    });
  }

  // ====== HERO CRUD ======

  async getHeroData() {
    const heroes = await this.heroRepo.find({ order: { createdAt: 'DESC' }, take: 1 });
    const hero = heroes[0] ?? null;
    const socialLinks = await this.socialLinkRepo.find({ order: { sortOrder: 'ASC' } });
    
    // Возвращаем одиночный hero
    if (hero) {
      return {
        hero: {
          id: hero.id,
          name: hero.name,
          title: hero.title,
          bio: hero.bio,
          avatar: hero.avatar,
        },
        socialLinks,
      };
    }
    // Дефолтные данные если нет записи в БД
    return {
      hero: DEFAULT_HERO,
      socialLinks: DEFAULT_SOCIAL_LINKS,
    };
  }

  // ====== CONTACT MESSAGES ======

  async getContactInfo() {
    return DEFAULT_CONTACT_INFO;
  }

  async createMessage(dto: CreateContactMessageDto) {
    // 1. Honeypot check
    if (dto.nickname && dto.nickname.trim() !== '') {
      console.warn(`Spam bot detected via nickname honeypot: ${dto.nickname}`);
      return {
        id: 999999,
        name: dto.name,
        email: dto.email,
        subject: dto.subject,
        message: dto.message,
        createdAt: new Date(),
      } as any;
    }

    // 2. Captcha verification
    const isCaptchaValid = this.captchaService.verifyCaptcha(dto.captchaAnswer || '', dto.captchaToken || '');
    if (!isCaptchaValid) {
      throw new BadRequestException('Неверный ответ на капчу / Incorrect captcha answer');
    }

    // 3. Save message
    const { nickname, captchaAnswer, captchaToken, ...messageData } = dto;
    const message = this.messageRepo.create(messageData);
    return this.messageRepo.save(message);
  }

  async getSettings(): Promise<Settings> {
    let settings = await this.settingsRepo.findOne({ where: { id: 1 } });
    if (!settings) {
      settings = this.settingsRepo.create({ id: 1 });
      await this.settingsRepo.save(settings);
    }
    return settings;
  }
}
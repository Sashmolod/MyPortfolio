import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Skill, Hero, Project, ContactMessage, SocialLink, Settings, SkillCategory } from '../admin/entities';
import { CreateContactMessageDto } from '../admin/dto/create-contact-message.dto';
import { createHmac } from 'crypto';

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
      hero: {
        id: null,
        name: 'John Doe',
        title: 'Full Stack Developer',
        bio: 'I build things for the web and beyond.',
        avatar: null,
      },
      socialLinks: [
        { platform: 'GitHub', url: 'https://github.com/yourusername' },
        { platform: 'LinkedIn', url: 'https://linkedin.com/in/yourusername' },
        { platform: 'Twitter', url: 'https://twitter.com/yourusername' },
      ],
    };
  }

  // ====== CONTACT MESSAGES ======

  async getContactInfo() {
    return {
      email: 'john@example.com',
      phone: '+1 234 567 890',
      address: 'Kyiv, Ukraine',
    };
  }

  generateCaptcha() {
    const a = Math.floor(Math.random() * 9) + 1; // 1-9
    const b = Math.floor(Math.random() * 9) + 1; // 1-9
    const isPlus = Math.random() > 0.5;
    
    let question = '';
    let expectedAnswer = 0;
    
    if (isPlus) {
      question = `${a} + ${b} = ?`;
      expectedAnswer = a + b;
    } else {
      const maxVal = Math.max(a, b);
      const minVal = Math.min(a, b);
      question = `${maxVal} - ${minVal} = ?`;
      expectedAnswer = maxVal - minVal;
    }
    
    const captchaSecret = this.configService.get<string>('CAPTCHA_SECRET');
    if (!captchaSecret) {
      throw new Error('CAPTCHA_SECRET is not configured');
    }
    const expiresAt = Date.now() + 3 * 60 * 1000; // 3 mins
    
    const hmac = createHmac('sha256', captchaSecret);
    hmac.update(`${expectedAnswer}:${expiresAt}`);
    const signature = hmac.digest('hex');
    
    const token = `${expiresAt}:${signature}`;
    
    return { question, token };
  }

  verifyCaptcha(answer: string, token: string): boolean {
    if (!token || !answer) {
      return false;
    }
    
    const parts = token.split(':');
    if (parts.length !== 2) {
      return false;
    }
    
    const [expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    
    if (isNaN(expiresAt) || expiresAt < Date.now()) {
      return false;
    }
    
    const captchaSecret = this.configService.get<string>('CAPTCHA_SECRET');
    if (!captchaSecret) {
      return false;
    }
    const cleanAnswer = answer.trim();
    
    const hmac = createHmac('sha256', captchaSecret);
    hmac.update(`${cleanAnswer}:${expiresAtStr}`);
    const expectedSignature = hmac.digest('hex');
    
    return signature === expectedSignature;
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
    const isCaptchaValid = this.verifyCaptcha(dto.captchaAnswer || '', dto.captchaToken || '');
    if (!isCaptchaValid) {
      throw new BadRequestException('Неверный ответ на капчу / Incorrect captcha answer');
    }

    // 3. Save message
    const { nickname, captchaAnswer, captchaToken, ...messageData } = dto;
    const message = this.messageRepo.create(messageData);
    return this.messageRepo.save(message);
  }

  // ====== AI FEATURES ======

  async askDoodlyChat(message: string, lang = 'ru'): Promise<{ response: string }> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      const offlineReplies = lang === 'en' ? [
        "Oops! It seems I don't have access to my AI brain yet (need to set GEMINI_API_KEY in the .env file)! 🔌 But I'm still happy to chat!",
        "I'd love to chat about anything, but my AI brain is currently disconnected by the developer. Ask me something else! 📎",
        "My API key got lost among the paperclips in the drawer! 🗄️ Ask the developer to add GEMINI_API_KEY."
      ] : [
        "Ой! Кажется, у меня еще нет доступа к моему AI-мозгу (нужно задать GEMINI_API_KEY в файле .env)! 🔌 Но я всё равно рад пообщаться!",
        "Я бы с радостью поболтал на любые темы, но пока мой AI-мозг отключен разработчиком. Спросите меня о чём-нибудь ещё! 📎",
        "Мой API-ключ потерялся среди скрепок в ящике! 🗄️ Попросите разработчика добавить GEMINI_API_KEY."
      ];
      return { response: offlineReplies[Math.floor(Math.random() * offlineReplies.length)] };
    }

    try {
      const skills = await this.getAllSkills();
      const projects = await this.getAllProjects();
      const heroData = await this.getHeroData();

      const skillsList = skills.map(s => `${s.name} (${s.level}%)`).join(', ');
      const projectsList = projects.map(p => `${p.title}: ${p.description}`).join('; ');
      const hero = heroData.hero ?? { name: 'Неизвестно', title: 'Full Stack Developer', bio: '' };

      const systemPrompt = `Ты — скрепка-помощник Дудли (Smart Clip) на сайте-портфолио разработчика.
У тебя нарисованы круглые очки и синяя галстук-бабочка. В руках ты держишь карандаш и листок с отметкой А+.
Твой характер: дружелюбная, умная, остроумная, слегка саркастичная канцелярская скрепка.
Отвечай коротко (максимум 2-3 предложения), живо и весело, используй эмодзи (📎, ✏️, 🎓, 📝, ☕, 🥸).
Информация о владельце сайта (используй её для ответов на вопросы о разработчике):
- Имя: ${hero.name}
- Должность: ${hero.title}
- Описание: ${hero.bio}
- Навыки: ${skillsList}
- Проекты: ${projectsList}

Посетитель сайта зашел с интерфейсом на языке: ${lang.toUpperCase()}. Ответь ему на языке: ${lang === 'en' ? 'English (английский)' : 'Russian (русский)'}.`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemPrompt }]
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: message }]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API status ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return { response: text?.trim() || (lang === 'en' ? 'Oops, I got distracted and forgot what I wanted to say... 📎' : 'Ой, я задумался и забыл, что хотел сказать... 📎') };
    } catch (error) {
      console.error('Gemini API error:', error);
      return { response: (lang === 'en' ? 'It seems my AI brain lost connection... Try again in a bit! 🔌' : 'Кажется, пропала связь с моим AI-мозгом... Попробуйте чуть позже! 🔌') };
    }
  }

  async guessDoodle(base64Image: string, lang = 'ru'): Promise<{ guess: string }> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      const offlineGuesses = lang === 'en' ? [
        "Hmm! Unfortunately, my AI eye is currently off (no GEMINI_API_KEY set), but this drawing definitely looks like a masterpiece! 🎨",
        "I can't inspect your sketch without an API key yet, but I'm sure Leonardo da Vinci would envy such shading! ✏️",
        "Oh, my AI lens is a bit dusty! Without a key in .env I can't guess, but this is definitely something beautiful! 🌟"
      ] : [
        "Хм-м! К сожалению, мой AI-глаз сейчас отключен (не задан GEMINI_API_KEY), но этот рисунок определенно выглядит как шедевр! 🎨",
        "Я пока не могу рассмотреть ваш рисунок без API-ключа, но уверен, Леонардо да Винчи позавидовал бы такой штриховке! ✏️",
        "Ой, мой AI-объектив запылился! Без ключа в .env я не угадаю, но это точно что-то прекрасное! 🌟"
      ];
      return { guess: offlineGuesses[Math.floor(Math.random() * offlineGuesses.length)] };
    }

    try {
      let base64Data = base64Image;
      let mimeType = 'image/png';
      if (base64Image.includes(';base64,')) {
        const parts = base64Image.split(';base64,');
        mimeType = parts[0].replace('data:', '');
        base64Data = parts[1];
      }

      const prompt = lang === 'en' ? `You are Doodly, the smart paperclip. Look at this quick hand-drawn sketch drawn by the visitor on the canvas.
Guess what item or creature this is, and describe it in a playful, cute paperclip tone. Give a very short answer (1-2 sentences).
Your guess should start with guessing words (e.g. "Wow, that is...", "Hmm, looks like...", "I see a..."). Respond in English.` : `Ты — умная скрепка Дудли. Посмотри на этот быстрый набросок от руки, нарисованный посетителем на холсте.
Угадай, что это за предмет или существо, опиши его в шутливом и милом тоне скрепки. Дай очень короткий ответ (1-2 предложения).
Ответ должен начинаться со слов угадывания (например: "Ого, это же...", "Хм-м, похоже на...", "Я вижу здесь..."). Ответь на русском языке.`;

       const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Data
                  }
                },
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini Vision API status ${response.status}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return { guess: text?.trim() || (lang === 'en' ? "Hmm, I can't make out any lines... Draw something clearer! 🎨" : 'Хм-м, не могу разобрать ни одной линии... Нарисуйте что-нибудь почетче! 🎨') };
    } catch (error) {
      console.error('Gemini Vision API error:', error);
      return { guess: (lang === 'en' ? 'Oops! My AI vision got blurry. Try again! 🔌' : 'Ой! У меня зарябило в глазах от этого шедевра. Попробуйте угадать еще раз! 🔌') };
    }
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
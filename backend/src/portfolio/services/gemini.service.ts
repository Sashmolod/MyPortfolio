import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Skill, Hero, Project } from '../../shared/entities';

/**
 * Сервис для интеграции с Google Gemini API.
 * Отвечает за общение с интерактивным помощником скрепкой Дудли (Doodly)
 * и распознавание набросков (doodles), нарисованных пользователем на холсте.
 */
@Injectable()
export class GeminiService {
  constructor(
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,
    @InjectRepository(Hero)
    private heroRepo: Repository<Hero>,
    @InjectRepository(Project)
    private projectRepo: Repository<Project>,
    private configService: ConfigService,
  ) {}

  /**
   * Запрос к чату со скрепкой Дудли.
   * Конструирует контекстный системный промпт на основе информации о разработчике (навыки, проекты, био)
   * и отправляет сообщение пользователя в модель gemini-2.5-flash.
   * Поддерживает ограничение по времени (таймаут 10 секунд).
   *
   * @param message Текст сообщения от пользователя
   * @param lang Код языка ('ru' или 'en') для ответа на соответствующем языке
   * @returns Объект с ответом от Дудли
   */
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
      const skills = await this.skillRepo.find({ order: { sortOrder: 'ASC' } });
      const projects = await this.projectRepo.find({ order: { sortOrder: 'ASC' }, relations: { skills: true } });
      const heroes = await this.heroRepo.find({ order: { createdAt: 'DESC' }, take: 1 });
      const hero = heroes[0] ?? { name: 'Неизвестно', title: 'Full Stack Developer', bio: '' };

      const skillsList = skills.map(s => `${s.name} (${s.level}%)`).join(', ');
      const projectsList = projects.map(p => `${p.title}: ${p.description}`).join('; ');

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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

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
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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

  /**
   * Распознавание рисунка пользователя на холсте.
   * Отправляет base64-изображение (рисунок) и специальный промпт в Gemini API (gemini-2.5-flash)
   * для получения предположения о том, что нарисовано на холсте, в шутливом тоне скрепки.
   * Поддерживает ограничение по времени (таймаут 10 секунд).
   *
   * @param base64Image Изображение в формате Base64 Data URL
   * @param lang Код языка ('ru' или 'en') для ответа на соответствующем языке
   * @returns Объект с текстовой догадкой Дудли
   */
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

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
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
}

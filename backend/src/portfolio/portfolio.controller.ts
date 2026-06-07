import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse, ApiBody } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { CreateContactMessageDto } from '../admin/dto/create-contact-message.dto';
import { Hero } from '../admin/entities/hero.entity';
import { Skill } from '../admin/entities/skill.entity';
import { Project } from '../admin/entities/project.entity';
import { Settings } from '../admin/entities/settings.entity';
import {
  ContactInfoDto,
  DoodlyChatRequestDto,
  DoodlyChatResponseDto,
  DoodlyGuessRequestDto,
  DoodlyGuessResponseDto,
  HeroDataDto,
} from './dto/portfolio.dto';

// Re-export for Swagger schema reference
export { CreateContactMessageDto } from '../admin/dto/create-contact-message.dto';

@ApiTags('portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  // ====== HERO ======

  @ApiTags('hero')
  @ApiOperation({ summary: 'Получить данные секции Hero / приветствия (публичный)' })
  @ApiOkResponse({ description: 'Данные секции Hero успешно получены', type: HeroDataDto })
  @Get('hero')
  getHeroData(): Promise<HeroDataDto> {
    return this.portfolioService.getHeroData();
  }


  // ====== SKILLS ======

  @ApiTags('skills')
  @ApiOperation({ summary: 'Получить список всех навыков (публичный)' })
  @ApiOkResponse({ description: 'Список навыков успешно получен', type: [Skill] })
  @Get('skills')
  getAllSkills(): Promise<Skill[]> {
    return this.portfolioService.getAllSkills();
  }

  // ====== PROJECTS ======

  @ApiTags('projects')
  @ApiOperation({ summary: 'Получить список всех проектов (публичный)' })
  @ApiOkResponse({ description: 'Список проектов успешно получен', type: [Project] })
  @Get('projects')
  getAllProjects(): Promise<Project[]> {
    return this.portfolioService.getAllProjects();
  }

  // ====== CONTACT ======

  @ApiTags('contact')
  @ApiOperation({ summary: 'Получить контактную информацию (публичный)' })
  @ApiOkResponse({ description: 'Контактная информация успешно получена', type: ContactInfoDto })
  @Get('contact')
  getContactInfo(): Promise<ContactInfoDto> {
    return this.portfolioService.getContactInfo();
  }

  @ApiTags('message')
  @ApiOperation({ summary: 'Отправить контактное сообщение через форму обратной связи' })
  @ApiBody({ type: CreateContactMessageDto })
  @ApiResponse({ status: 201, description: 'Сообщение успешно создано и отправлено' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации полей сообщения' })
  @Post('message')
  async createMessage(@Body() dto: CreateContactMessageDto) {
    return this.portfolioService.createMessage(dto);
  }

  @ApiTags('doodly')
  @ApiOperation({ summary: 'Задать вопрос ассистенту Doodly AI' })
  @ApiBody({ type: DoodlyChatRequestDto })
  @ApiOkResponse({ description: 'Ответ от Doodly AI получен', type: DoodlyChatResponseDto })
  @Post('doodly/chat')
  async askDoodlyChat(@Body() body: DoodlyChatRequestDto): Promise<DoodlyChatResponseDto> {
    return this.portfolioService.askDoodlyChat(body.message);
  }

  @ApiTags('doodly')
  @ApiOperation({ summary: 'Попросить Doodly AI угадать рисунок с холста' })
  @ApiBody({ type: DoodlyGuessRequestDto })
  @ApiOkResponse({ description: 'Распознавание рисунка завершено', type: DoodlyGuessResponseDto })
  @Post('doodly/guess')
  async guessDoodle(@Body() body: DoodlyGuessRequestDto): Promise<DoodlyGuessResponseDto> {
    return this.portfolioService.guessDoodle(body.image);
  }

  @ApiTags('settings')
  @ApiOperation({ summary: 'Получить публичные настройки сайта (пасхалки и анимации)' })
  @ApiOkResponse({ description: 'Настройки успешно получены', type: Settings })
  @Get('settings')
  getSettings(): Promise<Settings> {
    return this.portfolioService.getSettings();
  }
}
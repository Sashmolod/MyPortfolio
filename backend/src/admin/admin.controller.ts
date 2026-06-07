import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { CreateContactMessageDto } from './dto/create-contact-message.dto';
import { CreateHeroDto } from './dto/create-hero.dto';
import { CreateSocialLinkDto } from './dto/create-social-link.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateHeroDto } from './dto/update-hero.dto';
import { UpdateSocialLinkDto } from './dto/update-social-link.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuditLogInterceptor } from './audit-log.interceptor';
import { Skill, Project, ContactMessage, Hero, SocialLink, Settings } from './entities';

/**
 * Админ-контроллер - ВСЕ эндпоинты защищены JwtAuthGuard.
 * В Swagger отображается кнопка "Authorize" для ввода JWT токена.
 */
@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AuditLogInterceptor)
@ApiBearerAuth('jwt-in-header')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ==================== SKILLS ====================
  @ApiTags('skills')
  @ApiOperation({ summary: 'Получить все навыки (требуется JWT)' })
  @ApiOkResponse({ description: 'Список навыков успешно получен', type: [Skill] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get('skills')
  async getAllSkills(): Promise<Skill[]> {
    return this.adminService.getAllSkills();
  }

  @ApiTags('skills')
  @ApiOperation({ summary: 'Получить навык по ID (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID навыка' })
  @ApiOkResponse({ description: 'Данные навыка найдены', type: Skill })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Навык не найден' })
  @Get('skill/:id')
  async getSkill(@Param('id', new ParseIntPipe()) id: number): Promise<Skill> {
    return this.adminService.getSkill(id);
  }

  @ApiTags('skills')
  @ApiOperation({ summary: 'Создать новый навык (требуется JWT)' })
  @ApiBody({ type: CreateSkillDto })
  @ApiResponse({ status: 201, description: 'Навык успешно создан', type: Skill })
  @ApiResponse({ status: 400, description: 'Ошибка валидации входящих данных' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Post('skill')
  async createSkill(@Body() dto: CreateSkillDto): Promise<Skill> {
    return this.adminService.createSkill(dto);
  }

  @ApiTags('skills')
  @ApiOperation({ summary: 'Обновить навык (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID навыка' })
  @ApiBody({ type: UpdateSkillDto })
  @ApiOkResponse({ description: 'Навык успешно обновлен', type: Skill })
  @ApiResponse({ status: 400, description: 'Ошибка валидации входящих данных' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Навык не найден' })
  @Put('skill/:id')
  async updateSkill(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() dto: UpdateSkillDto,
  ): Promise<Skill> {
    return this.adminService.updateSkill(id, dto);
  }

  @ApiTags('skills')
  @ApiOperation({ summary: 'Удалить навык (мягкое удаление, требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID навыка' })
  @ApiOkResponse({ description: 'Навык успешно перемещен в удаленные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Навык не найден' })
  @Delete('skill/:id')
  async deleteSkill(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.deleteSkill(id);
  }

  // ==================== PROJECTS ====================
  @ApiTags('projects')
  @ApiOperation({ summary: 'Получить все проекты (требуется JWT)' })
  @ApiOkResponse({ description: 'Список проектов успешно получен', type: [Project] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get('projects')
  async getAllProjects(): Promise<Project[]> {
    return this.adminService.getAllProjects();
  }

  @ApiTags('projects')
  @ApiOperation({ summary: 'Получить проект по ID (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID проекта' })
  @ApiOkResponse({ description: 'Данные проекта найдены', type: Project })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Проект не найден' })
  @Get('project/:id')
  async getProject(@Param('id', new ParseIntPipe()) id: number): Promise<Project> {
    return this.adminService.getProject(id);
  }

  @ApiTags('projects')
  @ApiOperation({ summary: 'Создать новый проект (требуется JWT)' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 201, description: 'Проект успешно создан', type: Project })
  @ApiResponse({ status: 400, description: 'Ошибка валидации входящих данных' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Post('project')
  async createProject(@Body() dto: CreateProjectDto): Promise<Project> {
    return this.adminService.createProject(dto);
  }

  @ApiTags('projects')
  @ApiOperation({ summary: 'Обновить проект (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID проекта' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiOkResponse({ description: 'Проект успешно обновлен', type: Project })
  @ApiResponse({ status: 400, description: 'Ошибка валидации входящих данных' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Проект не найден' })
  @Put('project/:id')
  async updateProject(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() dto: UpdateProjectDto,
  ): Promise<Project> {
    return this.adminService.updateProject(id, dto);
  }

  @ApiTags('projects')
  @ApiOperation({ summary: 'Удалить проект (мягкое удаление, требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID проекта' })
  @ApiOkResponse({ description: 'Проект успешно перемещен в удаленные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Проект не найден' })
  @Delete('project/:id')
  async deleteProject(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.deleteProject(id);
  }

  // ==================== HERO ====================
  @ApiTags('hero')
  @ApiOperation({ summary: 'Получить все записи Hero (требуется JWT)' })
  @ApiOkResponse({ description: 'Список записей Hero успешно получен', type: [Hero] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get('hero')
  async getAllHeroes(): Promise<Hero[]> {
    return this.adminService.getAllHeroes();
  }

  @ApiTags('hero')
  @ApiOperation({ summary: 'Получить запись Hero по ID (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID записи Hero' })
  @ApiOkResponse({ description: 'Данные Hero найдены', type: Hero })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Запись не найдена' })
  @Get('hero/:id')
  async getHero(@Param('id') id: number): Promise<Hero> {
    return this.adminService.getHero(id);
  }

  @ApiTags('hero')
  @ApiOperation({ summary: 'Создать новую запись Hero (требуется JWT)' })
  @ApiBody({ type: CreateHeroDto })
  @ApiResponse({ status: 201, description: 'Запись Hero успешно создана', type: Hero })
  @ApiResponse({ status: 400, description: 'Ошибка валидации входящих данных' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Post('hero')
  async createHero(@Body() dto: CreateHeroDto): Promise<Hero> {
    return this.adminService.createHero(dto);
  }

  @ApiTags('hero')
  @ApiOperation({ summary: 'Обновить запись Hero (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID записи Hero' })
  @ApiBody({ type: UpdateHeroDto })
  @ApiOkResponse({ description: 'Запись Hero успешно обновлена', type: Hero })
  @ApiResponse({ status: 400, description: 'Ошибка валидации входящих данных' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Запись не найдена' })
  @Put('hero/:id')
  async updateHero(@Param('id') id: number, @Body() dto: UpdateHeroDto): Promise<Hero> {
    return this.adminService.updateHero(id, dto);
  }

  @ApiTags('hero')
  @ApiOperation({ summary: 'Удалить запись Hero (мягкое удаление, требуется JWT)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID записи Hero' })
  @ApiOkResponse({ description: 'Запись успешно перемещена в удаленные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Запись не найдена' })
  @Delete('hero/:id')
  async deleteHero(@Param('id') id: number) {
    return this.adminService.deleteHero(id);
  }

  // ==================== CONTACT MESSAGES ====================
  @ApiTags('messages')
  @ApiOperation({ summary: 'Получить все контактные сообщения (требуется JWT)' })
  @ApiOkResponse({ description: 'Список сообщений успешно получен', type: [ContactMessage] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get('messages')
  async getAllMessages(): Promise<ContactMessage[]> {
    return this.adminService.getAllMessages();
  }

  @ApiTags('messages')
  @ApiOperation({ summary: 'Получить сообщение по ID (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID сообщения' })
  @ApiOkResponse({ description: 'Сообщение найдено', type: ContactMessage })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Сообщение не найдено' })
  @Get('message/:id')
  async getMessage(@Param('id', new ParseIntPipe()) id: number): Promise<ContactMessage> {
    return this.adminService.getMessage(id);
  }

  @ApiTags('messages')
  @ApiOperation({ summary: 'Создать сообщение (публичная форма)' })
  @ApiBody({ type: CreateContactMessageDto })
  @ApiResponse({ status: 201, description: 'Сообщение успешно создано', type: ContactMessage })
  @ApiResponse({ status: 400, description: 'Ошибка валидации входящих данных' })
  @Post('message')
  async createMessage(@Body() dto: CreateContactMessageDto): Promise<ContactMessage> {
    return this.adminService.createMessage(dto);
  }

  @ApiTags('messages')
  @ApiOperation({ summary: 'Удалить сообщение (мягкое удаление, требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID сообщения' })
  @ApiOkResponse({ description: 'Сообщение успешно перемещено в удаленные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Сообщение не найдено' })
  @Delete('message/:id')
  async deleteMessage(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.deleteMessage(id);
  }

  // ==================== SOCIAL LINKS ====================
  @ApiTags('social-links')
  @ApiOperation({ summary: 'Получить все социальные ссылки (требуется JWT)' })
  @ApiOkResponse({ description: 'Список социальных ссылок получен', type: [SocialLink] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get('social-links')
  async getAllSocialLinks(): Promise<SocialLink[]> {
    return this.adminService.getAllSocialLinks();
  }

  @ApiTags('social-links')
  @ApiOperation({ summary: 'Получить социальную ссылку по ID (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID ссылки' })
  @ApiOkResponse({ description: 'Ссылка успешно найдена', type: SocialLink })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Ссылка не найдена' })
  @Get('social-link/:id')
  async getSocialLink(@Param('id', new ParseIntPipe()) id: number): Promise<SocialLink> {
    return this.adminService.getSocialLink(id);
  }

  @ApiTags('social-links')
  @ApiOperation({ summary: 'Создать социальную ссылку (требуется JWT)' })
  @ApiBody({ type: CreateSocialLinkDto })
  @ApiResponse({ status: 201, description: 'Ссылка успешно создана', type: SocialLink })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Post('social-link')
  async createSocialLink(@Body() dto: CreateSocialLinkDto): Promise<SocialLink> {
    return this.adminService.createSocialLink(dto);
  }

  @ApiTags('social-links')
  @ApiOperation({ summary: 'Обновить социальную ссылку (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID ссылки' })
  @ApiBody({ type: UpdateSocialLinkDto })
  @ApiOkResponse({ description: 'Ссылка успешно обновлена', type: SocialLink })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Ссылка не найдена' })
  @Put('social-link/:id')
  async updateSocialLink(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() dto: UpdateSocialLinkDto,
  ): Promise<SocialLink> {
    return this.adminService.updateSocialLink(id, dto);
  }

  @ApiTags('social-links')
  @ApiOperation({ summary: 'Удалить социальную ссылку (мягкое удаление, требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID ссылки' })
  @ApiOkResponse({ description: 'Ссылка успешно перемещена в удаленные' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Ссылка не найдена' })
  @Delete('social-link/:id')
  async deleteSocialLink(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.deleteSocialLink(id);
  }

  // ==================== RECOVERY / DELETED ITEMS ====================

  @ApiTags('skills')
  @ApiOperation({ summary: 'Получить список удаленных навыков (требуется JWT)' })
  @ApiOkResponse({ description: 'Список удаленных навыков получен', type: [Skill] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get('skills/deleted')
  async getDeletedSkills(): Promise<Skill[]> {
    return this.adminService.getDeletedSkills();
  }

  @ApiTags('skills')
  @ApiOperation({ summary: 'Восстановить удаленный навык (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID навыка' })
  @ApiOkResponse({ description: 'Навык успешно восстановлен', type: Skill })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Навык не найден' })
  @Post('skill/:id/restore')
  async restoreSkill(@Param('id', new ParseIntPipe()) id: number): Promise<Skill> {
    return this.adminService.restoreSkill(id);
  }

  @ApiTags('skills')
  @ApiOperation({ summary: 'Окончательно удалить навык из базы данных (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID навыка' })
  @ApiOkResponse({ description: 'Навык успешно удален навсегда' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Навык не найден' })
  @Delete('skill/:id/hard')
  async hardDeleteSkill(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.hardDeleteSkill(id);
  }

  @ApiTags('projects')
  @ApiOperation({ summary: 'Получить список удаленных проектов (требуется JWT)' })
  @ApiOkResponse({ description: 'Список удаленных проектов получен', type: [Project] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get('projects/deleted')
  async getDeletedProjects(): Promise<Project[]> {
    return this.adminService.getDeletedProjects();
  }

  @ApiTags('projects')
  @ApiOperation({ summary: 'Восстановить удаленный проект (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID проекта' })
  @ApiOkResponse({ description: 'Проект успешно восстановлен', type: Project })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Проект не найден' })
  @Post('project/:id/restore')
  async restoreProject(@Param('id', new ParseIntPipe()) id: number): Promise<Project> {
    return this.adminService.restoreProject(id);
  }

  @ApiTags('projects')
  @ApiOperation({ summary: 'Окончательно удалить проект из базы данных (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID проекта' })
  @ApiOkResponse({ description: 'Проект успешно удален навсегда' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Проект не найден' })
  @Delete('project/:id/hard')
  async hardDeleteProject(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.hardDeleteProject(id);
  }

  @ApiTags('messages')
  @ApiOperation({ summary: 'Получить список удаленных сообщений (требуется JWT)' })
  @ApiOkResponse({ description: 'Список удаленных сообщений получен', type: [ContactMessage] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get('messages/deleted')
  async getDeletedMessages(): Promise<ContactMessage[]> {
    return this.adminService.getDeletedMessages();
  }

  @ApiTags('messages')
  @ApiOperation({ summary: 'Восстановить удаленное сообщение (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID сообщения' })
  @ApiOkResponse({ description: 'Сообщение успешно восстановлено', type: ContactMessage })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Сообщение не найдено' })
  @Post('message/:id/restore')
  async restoreMessage(@Param('id', new ParseIntPipe()) id: number): Promise<ContactMessage> {
    return this.adminService.restoreMessage(id);
  }

  @ApiTags('messages')
  @ApiOperation({ summary: 'Окончательно удалить сообщение из базы данных (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID сообщения' })
  @ApiOkResponse({ description: 'Сообщение успешно удалено навсегда' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Сообщение не найдено' })
  @Delete('message/:id/hard')
  async hardDeleteMessage(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.hardDeleteMessage(id);
  }

  @ApiTags('hero')
  @ApiOperation({ summary: 'Получить список удаленных записей Hero (требуется JWT)' })
  @ApiOkResponse({ description: 'Список удаленных записей получен', type: [Hero] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get('hero/deleted')
  async getDeletedHeroes(): Promise<Hero[]> {
    return this.adminService.getDeletedHeroes();
  }

  @ApiTags('hero')
  @ApiOperation({ summary: 'Восстановить удаленную запись Hero (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID записи Hero' })
  @ApiOkResponse({ description: 'Запись успешно восстановлена', type: Hero })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Запись не найдена' })
  @Post('hero/:id/restore')
  async restoreHero(@Param('id') id: number): Promise<Hero> {
    return this.adminService.restoreHero(id);
  }

  @ApiTags('hero')
  @ApiOperation({ summary: 'Окончательно удалить запись Hero из базы данных (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID записи Hero' })
  @ApiOkResponse({ description: 'Запись Hero успешно удалена навсегда' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Запись не найдена' })
  @Delete('hero/:id/hard')
  async hardDeleteHero(@Param('id') id: number) {
    return this.adminService.hardDeleteHero(id);
  }

  @ApiTags('social-links')
  @ApiOperation({ summary: 'Получить список удаленных социальных ссылок (требуется JWT)' })
  @ApiOkResponse({ description: 'Список удаленных ссылок получен', type: [SocialLink] })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get('social-links/deleted')
  async getDeletedSocialLinks(): Promise<SocialLink[]> {
    return this.adminService.getDeletedSocialLinks();
  }

  @ApiTags('social-links')
  @ApiOperation({ summary: 'Восстановить удаленную социальную ссылку (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID ссылки' })
  @ApiOkResponse({ description: 'Ссылка успешно восстановлена', type: SocialLink })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Ссылка не найдена' })
  @Post('social-link/:id/restore')
  async restoreSocialLink(@Param('id', new ParseIntPipe()) id: number): Promise<SocialLink> {
    return this.adminService.restoreSocialLink(id);
  }

  @ApiTags('social-links')
  @ApiOperation({ summary: 'Окончательно удалить социальную ссылку из базы данных (требуется JWT)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'ID ссылки' })
  @ApiOkResponse({ description: 'Ссылка успешно удалена навсегда' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Ссылка не найдена' })
  @Delete('social-link/:id/hard')
  async hardDeleteSocialLink(@Param('id', new ParseIntPipe()) id: number): Promise<any> {
    return this.adminService.hardDeleteSocialLink(id);
  }

  @ApiTags('settings')
  @ApiOperation({ 
    summary: 'Получить глобальные настройки сайта (требуется JWT)', 
    description: 'Возвращает единственный ряд настроек с переключателями пасхалок и анимаций.' 
  })
  @ApiOkResponse({ description: 'Настройки успешно получены', type: Settings })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Get('settings')
  async getSettings(): Promise<Settings> {
    return this.adminService.getSettings();
  }

  @ApiTags('settings')
  @ApiOperation({ 
    summary: 'Обновить глобальные настройки сайта (требуется JWT)', 
    description: 'Обновляет параметры анимаций и пасхалок.' 
  })
  @ApiBody({ type: UpdateSettingsDto })
  @ApiOkResponse({ description: 'Настройки успешно обновлены', type: Settings })
  @ApiResponse({ status: 400, description: 'Неверный формат входящих данных' })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @Put('settings')
  async updateSettings(@Body() dto: UpdateSettingsDto): Promise<Settings> {
    return this.adminService.updateSettings(dto);
  }
}
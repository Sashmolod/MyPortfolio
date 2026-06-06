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
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuditLogInterceptor } from './audit-log.interceptor';

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
  @ApiOperation({ summary: 'Get all skills (requires JWT auth)' })
  @ApiOkResponse({ description: 'Returns list of all skills', type: Array })
  @Get('skills')
  async getAllSkills() {
    return this.adminService.getAllSkills();
  }

  @ApiTags('skills')
  @ApiOperation({ summary: 'Get skill by ID (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'Skill ID' })
  @ApiOkResponse({ description: 'Returns skill data', type: CreateSkillDto })
  @Get('skill/:id')
  async getSkill(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.getSkill(id);
  }

  @ApiTags('skills')
  @ApiOperation({ summary: 'Create a new skill (requires JWT auth)' })
  @ApiBody({ type: CreateSkillDto })
  @ApiResponse({ status: 201, description: 'Skill successfully created' })
  @Post('skill')
  async createSkill(@Body() dto: CreateSkillDto) {
    return this.adminService.createSkill(dto);
  }

  @ApiTags('skills')
  @ApiOperation({ summary: 'Update a skill (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'Skill ID' })
  @ApiBody({ type: UpdateSkillDto })
  @ApiResponse({ status: 200, description: 'Skill successfully updated' })
  @Put('skill/:id')
  async updateSkill(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() dto: UpdateSkillDto,
  ) {
    return this.adminService.updateSkill(id, dto);
  }

  @ApiTags('skills')
  @ApiOperation({ summary: 'Delete a skill (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill successfully deleted' })
  @Delete('skill/:id')
  async deleteSkill(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.deleteSkill(id);
  }

  // ==================== PROJECTS ====================
  @ApiTags('projects')
  @ApiOperation({ summary: 'Get all projects (requires JWT auth)' })
  @ApiOkResponse({ description: 'Returns list of all projects', type: Array })
  @Get('projects')
  async getAllProjects() {
    return this.adminService.getAllProjects();
  }

  @ApiTags('projects')
  @ApiOperation({ summary: 'Get project by ID (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'Project ID' })
  @ApiOkResponse({ description: 'Returns project data', type: CreateProjectDto })
  @Get('project/:id')
  async getProject(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.getProject(id);
  }

  @ApiTags('projects')
  @ApiOperation({ summary: 'Create a new project (requires JWT auth)' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 201, description: 'Project successfully created' })
  @Post('project')
  async createProject(@Body() dto: CreateProjectDto) {
    return this.adminService.createProject(dto);
  }

  @ApiTags('projects')
  @ApiOperation({ summary: 'Update a project (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'Project ID' })
  @ApiBody({ type: UpdateProjectDto })
  @ApiResponse({ status: 200, description: 'Project successfully updated' })
  @Put('project/:id')
  async updateProject(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.adminService.updateProject(id, dto);
  }

  @ApiTags('projects')
  @ApiOperation({ summary: 'Delete a project (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project successfully deleted' })
  @Delete('project/:id')
  async deleteProject(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.deleteProject(id);
  }

  // ==================== HERO ====================
  @ApiTags('hero')
  @ApiOperation({ summary: 'Get all hero data (requires JWT auth)' })
  @ApiOkResponse({ description: 'Returns list of all hero data', type: Array })
  @Get('hero')
  async getAllHeroes() {
    return this.adminService.getAllHeroes();
  }

  @ApiTags('hero')
  @ApiOperation({ summary: 'Get hero by ID (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Hero ID' })
  @ApiOkResponse({ description: 'Returns hero data', type: CreateHeroDto })
  @Get('hero/:id')
  async getHero(@Param('id') id: number) {
    return this.adminService.getHero(id);
  }

  @ApiTags('hero')
  @ApiOperation({ summary: 'Create a new hero (requires JWT auth)' })
  @ApiBody({ type: CreateHeroDto })
  @ApiResponse({ status: 201, description: 'Hero successfully created' })
  @Post('hero')
  async createHero(@Body() dto: CreateHeroDto) {
    return this.adminService.createHero(dto);
  }

  @ApiTags('hero')
  @ApiOperation({ summary: 'Update a hero (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Hero ID' })
  @ApiBody({ type: UpdateHeroDto })
  @ApiResponse({ status: 200, description: 'Hero successfully updated' })
  @Put('hero/:id')
  async updateHero(@Param('id') id: number, @Body() dto: UpdateHeroDto) {
    return this.adminService.updateHero(id, dto);
  }

  @ApiTags('hero')
  @ApiOperation({ summary: 'Delete a hero (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Hero ID' })
  @ApiResponse({ status: 200, description: 'Hero successfully deleted' })
  @Delete('hero/:id')
  async deleteHero(@Param('id') id: number) {
    return this.adminService.deleteHero(id);
  }

  // ==================== CONTACT MESSAGES ====================
  @ApiTags('messages')
  @ApiOperation({ summary: 'Get all contact messages (requires JWT auth)' })
  @ApiOkResponse({ description: 'Returns list of all contact messages', type: Array })
  @Get('messages')
  async getAllMessages() {
    return this.adminService.getAllMessages();
  }

  @ApiTags('messages')
  @ApiOperation({ summary: 'Get message by ID (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'Message ID' })
  @ApiOkResponse({ description: 'Returns message data', type: CreateContactMessageDto })
  @Get('message/:id')
  async getMessage(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.getMessage(id);
  }

  @ApiTags('messages')
  @ApiOperation({ summary: 'Create a contact message (from frontend form)' })
  @ApiBody({ type: CreateContactMessageDto })
  @ApiResponse({ status: 201, description: 'Message successfully created' })
  @Post('message')
  async createMessage(@Body() dto: CreateContactMessageDto) {
    return this.adminService.createMessage(dto);
  }

  @ApiTags('messages')
  @ApiOperation({ summary: 'Delete a contact message (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message successfully deleted' })
  @Delete('message/:id')
  async deleteMessage(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.deleteMessage(id);
  }

  // ==================== SOCIAL LINKS ====================
  @ApiTags('social-links')
  @ApiOperation({ summary: 'Get all social links (requires JWT auth)' })
  @ApiOkResponse({ description: 'Returns list of all social links', type: Array })
  @Get('social-links')
  async getAllSocialLinks() {
    return this.adminService.getAllSocialLinks();
  }

  @ApiTags('social-links')
  @ApiOperation({ summary: 'Get social link by ID (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'Social Link ID' })
  @ApiOkResponse({ description: 'Returns social link data', type: CreateSocialLinkDto })
  @Get('social-link/:id')
  async getSocialLink(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.getSocialLink(id);
  }

  @ApiTags('social-links')
  @ApiOperation({ summary: 'Create a new social link (requires JWT auth)' })
  @ApiBody({ type: CreateSocialLinkDto })
  @ApiResponse({ status: 201, description: 'Social link successfully created' })
  @Post('social-link')
  async createSocialLink(@Body() dto: CreateSocialLinkDto) {
    return this.adminService.createSocialLink(dto);
  }

  @ApiTags('social-links')
  @ApiOperation({ summary: 'Update a social link (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'Social Link ID' })
  @ApiBody({ type: UpdateSocialLinkDto })
  @ApiResponse({ status: 200, description: 'Social link successfully updated' })
  @Put('social-link/:id')
  async updateSocialLink(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() dto: UpdateSocialLinkDto,
  ) {
    return this.adminService.updateSocialLink(id, dto);
  }

  @ApiTags('social-links')
  @ApiOperation({ summary: 'Delete a social link (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'Social Link ID' })
  @ApiResponse({ status: 200, description: 'Social link successfully deleted' })
  @Delete('social-link/:id')
  async deleteSocialLink(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.deleteSocialLink(id);
  }

  // ==================== RECOVERY / DELETED ITEMS ====================

  @ApiTags('skills')
  @ApiOperation({ summary: 'Get deleted skills (requires JWT auth)' })
  @Get('skills/deleted')
  async getDeletedSkills() {
    return this.adminService.getDeletedSkills();
  }

  @ApiTags('skills')
  @ApiOperation({ summary: 'Restore a deleted skill (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'Skill ID' })
  @Post('skill/:id/restore')
  async restoreSkill(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.restoreSkill(id);
  }

  @ApiTags('projects')
  @ApiOperation({ summary: 'Get deleted projects (requires JWT auth)' })
  @Get('projects/deleted')
  async getDeletedProjects() {
    return this.adminService.getDeletedProjects();
  }

  @ApiTags('projects')
  @ApiOperation({ summary: 'Restore a deleted project (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'Project ID' })
  @Post('project/:id/restore')
  async restoreProject(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.restoreProject(id);
  }

  @ApiTags('messages')
  @ApiOperation({ summary: 'Get deleted messages (requires JWT auth)' })
  @Get('messages/deleted')
  async getDeletedMessages() {
    return this.adminService.getDeletedMessages();
  }

  @ApiTags('messages')
  @ApiOperation({ summary: 'Restore a deleted message (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'Message ID' })
  @Post('message/:id/restore')
  async restoreMessage(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.restoreMessage(id);
  }

  @ApiTags('hero')
  @ApiOperation({ summary: 'Get deleted hero entries (requires JWT auth)' })
  @Get('hero/deleted')
  async getDeletedHeroes() {
    return this.adminService.getDeletedHeroes();
  }

  @ApiTags('hero')
  @ApiOperation({ summary: 'Restore a deleted hero entry (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Hero ID' })
  @Post('hero/:id/restore')
  async restoreHero(@Param('id') id: number) {
    return this.adminService.restoreHero(id);
  }

  @ApiTags('social-links')
  @ApiOperation({ summary: 'Get deleted social links (requires JWT auth)' })
  @Get('social-links/deleted')
  async getDeletedSocialLinks() {
    return this.adminService.getDeletedSocialLinks();
  }

  @ApiTags('social-links')
  @ApiOperation({ summary: 'Restore a deleted social link (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'integer', description: 'Social Link ID' })
  @Post('social-link/:id/restore')
  async restoreSocialLink(@Param('id', new ParseIntPipe()) id: number) {
    return this.adminService.restoreSocialLink(id);
  }
}
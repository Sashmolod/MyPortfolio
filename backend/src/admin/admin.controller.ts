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
import { CreateSkillDto, CreateProjectDto, CreateContactMessageDto, CreateHeroDto } from './dto/create.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

/**
 * Админ-контроллер - ВСЕ эндпоинты защищены JwtAuthGuard.
 * В Swagger отображается кнопка "Authorize" для ввода JWT токена.
 */
@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
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
  @ApiParam({ name: 'id', type: 'number', description: 'Skill ID' })
  @ApiOkResponse({ description: 'Returns skill data', type: CreateSkillDto })
  @Get('skill/:id')
  async getSkill(@Param('id') id: number) {
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
  @ApiParam({ name: 'id', type: 'number', description: 'Skill ID' })
  @ApiBody({ type: CreateSkillDto })
  @ApiResponse({ status: 200, description: 'Skill successfully updated' })
  @Put('skill/:id')
  async updateSkill(
    @Param('id') id: number,
    @Body() dto: CreateSkillDto,
  ) {
    return this.adminService.updateSkill(id, dto);
  }

  @ApiTags('skills')
  @ApiOperation({ summary: 'Delete a skill (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Skill ID' })
  @ApiResponse({ status: 200, description: 'Skill successfully deleted' })
  @Delete('skill/:id')
  async deleteSkill(@Param('id') id: number) {
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
  @ApiParam({ name: 'id', type: 'number', description: 'Project ID' })
  @ApiOkResponse({ description: 'Returns project data', type: CreateProjectDto })
  @Get('project/:id')
  async getProject(@Param('id') id: number) {
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
  @ApiParam({ name: 'id', type: 'number', description: 'Project ID' })
  @ApiBody({ type: CreateProjectDto })
  @ApiResponse({ status: 200, description: 'Project successfully updated' })
  @Put('project/:id')
  async updateProject(
    @Param('id') id: number,
    @Body() dto: CreateProjectDto,
  ) {
    return this.adminService.updateProject(id, dto);
  }

  @ApiTags('projects')
  @ApiOperation({ summary: 'Delete a project (requires JWT auth)' })
  @ApiParam({ name: 'id', type: 'number', description: 'Project ID' })
  @ApiResponse({ status: 200, description: 'Project successfully deleted' })
  @Delete('project/:id')
  async deleteProject(@Param('id') id: number) {
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
  @ApiBody({ type: CreateHeroDto })
  @ApiResponse({ status: 200, description: 'Hero successfully updated' })
  @Put('hero/:id')
  async updateHero(@Param('id') id: number, @Body() dto: CreateHeroDto) {
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
  @ApiParam({ name: 'id', type: 'number', description: 'Message ID' })
  @ApiOkResponse({ description: 'Returns message data', type: CreateContactMessageDto })
  @Get('message/:id')
  async getMessage(@Param('id') id: number) {
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
  @ApiParam({ name: 'id', type: 'number', description: 'Message ID' })
  @ApiResponse({ status: 200, description: 'Message successfully deleted' })
  @Delete('message/:id')
  async deleteMessage(@Param('id') id: number) {
    return this.adminService.deleteMessage(id);
  }
}
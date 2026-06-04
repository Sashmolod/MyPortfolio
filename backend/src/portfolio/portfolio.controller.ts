import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { CreateContactMessageDto } from '../admin/dto/create.dto';
import { JwtAuthGuard } from '../admin/jwt-auth.guard';

// Re-export for Swagger schema reference
export { CreateContactMessageDto } from '../admin/dto/create.dto';

@ApiTags('portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  // ====== HERO CRUD ======

  @ApiTags('hero')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create hero section data' })
  @ApiBody({ type: Object })
  @ApiResponse({ status: 201, description: 'Hero data created' })
  @Post('hero')
  createHero(@Body() data: Partial<any>) {
    return this.portfolioService.createHero(data);
  }

  @ApiTags('hero')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update hero section data' })
  @ApiBody({ type: Object })
  @ApiResponse({ status: 200, description: 'Hero data updated' })
  @Put('hero/:id')
  updateHero(@Param('id') id: number, @Body() data: Partial<any>) {
    return this.portfolioService.updateHero(id, data);
  }

  @ApiTags('hero')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete hero section data' })
  @ApiResponse({ status: 200, description: 'Hero data deleted' })
  @Delete('hero/:id')
  deleteHero(@Param('id') id: number) {
    return this.portfolioService.deleteHero(id);
  }

  @ApiTags('hero')
  @ApiOperation({ summary: 'Get hero section data (public)' })
  @ApiOkResponse({ description: 'Returns hero data', type: Object })
  @Get('hero')
  getHeroData() {
    return this.portfolioService.getHeroData();
  }

  // ====== SKILLS ======

  @ApiTags('skills')
  @ApiOperation({ summary: 'Get all skills' })
  @ApiOkResponse({ description: 'Returns list of all skills', type: Array })
  @Get('skills')
  getAllSkills() {
    return this.portfolioService.getAllSkills();
  }

  // ====== PROJECTS ======

  @ApiTags('projects')
  @ApiOperation({ summary: 'Get all projects' })
  @ApiOkResponse({ description: 'Returns list of all projects', type: Array })
  @Get('projects')
  getAllProjects() {
    return this.portfolioService.getAllProjects();
  }

  // ====== CONTACT ======

  @ApiTags('contact')
  @ApiOperation({ summary: 'Get contact information' })
  @ApiOkResponse({ description: 'Returns contact info', type: Object })
  @Get('contact')
  getContactInfo() {
    return this.portfolioService.getContactInfo();
  }

  @ApiTags('message')
  @ApiOperation({ summary: 'Submit a contact message from the frontend form' })
  @ApiBody({ type: CreateContactMessageDto })
  @ApiResponse({ status: 201, description: 'Message successfully submitted' })
  @Post('message')
  async createMessage(@Body() dto: CreateContactMessageDto) {
    return this.portfolioService.createMessage(dto);
  }
}
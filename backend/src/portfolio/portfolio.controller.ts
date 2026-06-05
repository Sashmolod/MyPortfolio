import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiOkResponse, ApiBody } from '@nestjs/swagger';
import { PortfolioService } from './portfolio.service';
import { CreateContactMessageDto } from '../admin/dto/create-contact-message.dto';

// Re-export for Swagger schema reference
export { CreateContactMessageDto } from '../admin/dto/create-contact-message.dto';

@ApiTags('portfolio')
@Controller('portfolio')
export class PortfolioController {
  constructor(private portfolioService: PortfolioService) {}

  // ====== HERO ======

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
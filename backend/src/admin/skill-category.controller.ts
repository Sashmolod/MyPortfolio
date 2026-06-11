import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SkillCategoryService } from './skill-category.service';
import { CreateSkillCategoryDto } from './dto/create-skill-category.dto';
import { UpdateSkillCategoryDto } from './dto/update-skill-category.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('admin/skill-categories')
@UseGuards(JwtAuthGuard)
export class SkillCategoryController {
  constructor(private readonly categoryService: SkillCategoryService) {}

  @Get()
  async findAll() {
    return this.categoryService.findAll();
  }

  @Get('flat')
  async getAllFlat() {
    return this.categoryService.getAllCategoriesFlat();
  }

  @Get('top-level')
  async getTopLevel() {
    return this.categoryService.getTopLevelCategories();
  }

  @Post()
  async create(@Body() dto: CreateSkillCategoryDto) {
    return this.categoryService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSkillCategoryDto) {
    return this.categoryService.updateById(Number(id), dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.categoryService.removeById(Number(id));
    return { message: `Category "${result.name}" deleted successfully` };
  }
}
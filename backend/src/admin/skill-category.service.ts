import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { SkillCategory, Skill } from '../shared/entities';
import { CreateSkillCategoryDto, UpdateSkillCategoryDto } from '../shared/dto';

@Injectable()
export class SkillCategoryService {
  constructor(
    @InjectRepository(SkillCategory)
    private categoryRepo: Repository<SkillCategory>,
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,
  ) {}

  async findAll(): Promise<SkillCategory[]> {
    const categories = await this.categoryRepo.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });

    // Build tree structure using ID
    const roots: SkillCategory[] = [];
    const childrenMap = new Map<number, SkillCategory[]>();

    for (const cat of categories) {
      if (!cat.parentId) {
        roots.push(cat);
      } else {
        if (!childrenMap.has(cat.parentId)) {
          childrenMap.set(cat.parentId, []);
        }
        childrenMap.get(cat.parentId).push(cat);
      }
    }

    // Attach subcategories to parents
    for (const root of roots) {
      root.subcategories = childrenMap.get(root.id) || [];
    }

    return roots;
  }

  async findAllFlat(): Promise<SkillCategory[]> {
    return this.categoryRepo.find({
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<SkillCategory> {
    const category = await this.categoryRepo.findOne({
      where: { id },
      relations: ['subcategories'],
    });
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return category;
  }

  async create(dto: CreateSkillCategoryDto): Promise<SkillCategory> {
    // Check if category with same name already exists
    const existing = await this.categoryRepo.findOne({
      where: { name: dto.name },
    });
    if (existing) {
      throw new BadRequestException(`Category "${dto.name}" already exists`);
    }

    // Validate parent exists if specified
    if (dto.parentId) {
      const parent = await this.categoryRepo.findOne({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new BadRequestException(`Parent category #${dto.parentId} not found`);
      }
    }

    const category = this.categoryRepo.create({
      name: dto.name,
      parentId: dto.parentId || null,
      sortOrder: dto.sortOrder ?? 0,
    });

    return this.categoryRepo.save(category);
  }

  async update(id: number, dto: UpdateSkillCategoryDto): Promise<SkillCategory> {
    const existing = await this.categoryRepo.findOne({
      where: { id },
      relations: ['subcategories'],
    });
    if (!existing) {
      throw new NotFoundException(`Category #${id} not found`);
    }

    // If renaming, check for conflicts
    if (dto.name && dto.name !== existing.name) {
      const nameExists = await this.categoryRepo.findOne({
        where: { name: dto.name },
      });
      if (nameExists) {
        throw new BadRequestException(`Category "${dto.name}" already exists`);
      }
    }

    // Validate parent exists if specified and changed
    if (dto.parentId !== undefined && dto.parentId !== existing.parentId) {
      if (dto.parentId) {
        const parent = await this.categoryRepo.findOne({
          where: { id: dto.parentId },
        });
        if (!parent) {
          throw new BadRequestException(`Parent category #${dto.parentId} not found`);
        }
        // Prevent circular reference: parent cannot be a child of this category
        if (await this.isCircularReference(existing.id, dto.parentId)) {
          throw new BadRequestException('Cannot set parent: would create a circular reference');
        }
      }
    }

    // Update fields
    if (dto.name) existing.name = dto.name;
    if (dto.parentId !== undefined) existing.parentId = dto.parentId || null;
    if (dto.sortOrder !== undefined) existing.sortOrder = dto.sortOrder;

    return this.categoryRepo.save(existing);
  }

  /**
    * Check if setting parentId as parent of categoryId would create a circular reference.
    */
  private async isCircularReference(categoryId: number, potentialParentId: number): Promise<boolean> {
    if (categoryId === potentialParentId) return true;

    let current = await this.categoryRepo.findOne({
      where: { id: potentialParentId },
      relations: ['parent'],
    });

    while (current?.parent) {
      if (current.parent.id === categoryId) return true;
      current = current.parent;
    }

    return false;
  }

  /**
    * Update category by ID.
    */
  async updateById(id: number, dto: UpdateSkillCategoryDto): Promise<SkillCategory> {
    return this.update(id, dto);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.categoryRepo.findOne({
      where: { id },
      relations: ['subcategories'],
    });
    if (!existing) {
      throw new NotFoundException(`Category #${id} not found`);
    }

    // Check if any skills use this category
    const skillCount = await this.skillRepo.createQueryBuilder('skill')
      .where('skill.categoryId = :id', { id: existing.id })
      .getCount();
    if (skillCount > 0) {
      throw new BadRequestException(
        `Cannot delete category "${existing.name}": ${skillCount} skill(s) are using it. Reassign or delete those skills first.`,
      );
    }

    // Check if any subcategories depend on this category
    if (existing.subcategories && existing.subcategories.length > 0) {
      throw new BadRequestException(
        `Cannot delete category "${existing.name}": it has ${existing.subcategories.length} subcategory(ies). Delete or reassign them first.`,
      );
    }

    await this.categoryRepo.remove(existing);
  }

  /**
    * Remove category by ID and return the removed category.
    */
  async removeById(id: number): Promise<SkillCategory> {
    const existing = await this.categoryRepo.findOne({
      where: { id },
      relations: ['subcategories'],
    });
    if (!existing) {
      throw new NotFoundException(`Category #${id} not found`);
    }

    // Check if any skills use this category
    const skillCount = await this.skillRepo.createQueryBuilder('skill')
      .where('skill.categoryId = :id', { id: existing.id })
      .getCount();
    if (skillCount > 0) {
      throw new BadRequestException(
        `Cannot delete category "${existing.name}": ${skillCount} skill(s) are using it. Reassign or delete those skills first.`,
      );
    }

    // Check if any subcategories depend on this category
    if (existing.subcategories && existing.subcategories.length > 0) {
      throw new BadRequestException(
        `Cannot delete category "${existing.name}": it has ${existing.subcategories.length} subcategory(ies). Delete or reassign them first.`,
      );
    }

    await this.categoryRepo.remove(existing);
    return existing;
  }

  /**
    * Get flat list of top-level categories only (for skill form dropdown).
    */
  async getTopLevelCategories(): Promise<SkillCategory[]> {
    return this.categoryRepo.find({
      where: { parentId: IsNull() },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }

  /**
    * Get all categories flat (for internal use).
    */
  async getAllCategoriesFlat(): Promise<SkillCategory[]> {
    return this.categoryRepo.find({
      order: { sortOrder: 'ASC', name: 'ASC' },
    });
  }
}
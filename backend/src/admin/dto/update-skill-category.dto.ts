import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateSkillCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @IsOptional()
  parentId?: number;

  @IsInt()
  @IsOptional()
  sortOrder?: number;
}

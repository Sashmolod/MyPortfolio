import { IsString, IsOptional, IsInt, IsNotEmpty } from 'class-validator';

export class CreateSkillCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  parentId?: number | null;

  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

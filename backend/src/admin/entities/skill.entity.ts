import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('skills')
export class Skill {
  @ApiProperty({ description: 'ID навыка', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Название навыка', example: 'JavaScript' })
  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @ApiPropertyOptional({ description: 'Класс иконки или эмодзи', example: 'react' })
  @Column({ name: 'icon', type: 'varchar', length: 255, nullable: true })
  icon: string;

  @ApiPropertyOptional({ description: 'Описание навыка', example: 'Разработка SPA приложений' })
  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @ApiPropertyOptional({ description: 'Уровень владения (0-100)', example: 90 })
  @Column({ name: 'level', type: 'int', default: 0 })
  level: number;

  @ApiPropertyOptional({ description: 'Порядок сортировки', example: 1 })
  @Index()
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @ApiProperty({ description: 'Дата создания', example: '2026-06-06T12:00:00Z' })
  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления', example: '2026-06-06T13:00:00Z' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Дата мягкого удаления', example: null, nullable: true })
  @Index()
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}

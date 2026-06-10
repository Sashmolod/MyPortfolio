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

@Entity('projects')
export class Project {
  @ApiProperty({ description: 'ID проекта', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Название проекта', example: 'Интернет-магазин' })
  @Column({ name: 'title', type: 'varchar', length: 255 })
  title: string;

  @ApiPropertyOptional({ description: 'Описание проекта', example: 'Разработка e-commerce платформы на React' })
  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  @ApiPropertyOptional({ description: 'Путь к изображению проекта', example: '/uploads/project1.png' })
  @Column({ name: 'image', type: 'varchar', length: 500, nullable: true })
  image: string;

  @ApiPropertyOptional({ description: 'Ссылка на проект или репозиторий', example: 'https://github.com/user/project' })
  @Column({ name: 'link', type: 'varchar', length: 500, nullable: true })
  link: string;

  @ApiPropertyOptional({ description: 'Использованные технологии (через запятую)', example: 'React, Redux, Node.js' })
  @Column({ name: 'technologies', type: 'text', nullable: true })
  technologies: string;

  @ApiPropertyOptional({ description: 'Порядок сортировки', example: 1 })
  @Index()
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @ApiPropertyOptional({ description: 'Количество просмотров', example: 42 })
  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

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

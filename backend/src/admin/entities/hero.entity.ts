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

@Entity('hero')
export class Hero {
  @ApiProperty({ description: 'ID профиля Hero', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Имя / Никнейм', example: 'Александр' })
  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ description: 'Заголовок / Профессия', example: 'Fullstack Разработчик' })
  @Column({ name: 'title', type: 'varchar', length: 150 })
  title: string;

  @ApiPropertyOptional({ description: 'Краткая биография / Текст приветствия', example: 'Я создаю веб-приложения...' })
  @Column({ name: 'bio', type: 'text', default: '' })
  bio: string;

  @ApiPropertyOptional({ description: 'Путь к файлу аватара', example: '/uploads/avatar.png' })
  @Column({ name: 'avatar', type: 'varchar', length: 255, default: '/favicon.svg' })
  avatar: string;

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

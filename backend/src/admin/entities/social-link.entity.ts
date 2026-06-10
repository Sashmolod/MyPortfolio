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

@Entity('social_links')
export class SocialLink {
  @ApiProperty({ description: 'ID социальной ссылки', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Название платформы', example: 'GitHub' })
  @Column({ name: 'platform', type: 'varchar', length: 100 })
  platform: string;

  @ApiProperty({ description: 'URL-ссылка на профиль', example: 'https://github.com/username' })
  @Column({ name: 'url', type: 'varchar', length: 255 })
  url: string;

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

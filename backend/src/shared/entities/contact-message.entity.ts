import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('contact_messages')
export class ContactMessage {
  @ApiProperty({ description: 'ID сообщения', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Имя отправителя', example: 'Иван Иванов' })
  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ description: 'Email отправителя', example: 'ivan@example.com' })
  @Column({ name: 'email', type: 'varchar', length: 150 })
  email: string;

  @ApiProperty({ description: 'Тема сообщения', example: 'Предложение о сотрудничестве' })
  @Column({ name: 'subject', type: 'varchar', length: 255 })
  subject: string;

  @ApiProperty({ description: 'Текст сообщения', example: 'Здравствуйте, хотим предложить вам проект...' })
  @Column({ name: 'message', type: 'text' })
  message: string;

  @ApiProperty({ description: 'Прочитано ли сообщение администратором', example: false })
  @Column({ name: 'is_read', type: 'boolean', default: false })
  isRead: boolean;

  @ApiPropertyOptional({ description: 'Список путей к прикрепленным файлам', type: [String], example: ['/uploads/file.pdf'] })
  @Column({ name: 'attachments', type: 'jsonb', nullable: true })
  attachments: string[];

  @ApiProperty({ description: 'Дата отправки сообщения', example: '2026-06-06T12:00:00Z' })
  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Дата мягкого удаления', example: null, nullable: true })
  @Index()
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}

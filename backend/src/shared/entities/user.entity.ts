import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional, ApiHideProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @ApiProperty({ description: 'ID пользователя', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Имя пользователя (логин)', example: 'admin' })
  @Column({ name: 'username', type: 'varchar', length: 50, unique: true })
  username: string;

  @ApiHideProperty()
  @Column({ name: 'password', type: 'varchar', length: 255, select: false })
  password: string;

  @ApiProperty({ description: 'Активен ли аккаунт пользователя', example: true })
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Количество неудачных попыток входа', example: 0 })
  @Column({ name: 'login_attempts', type: 'int', default: 0 })
  loginAttempts: number;

  @ApiPropertyOptional({ description: 'Время окончания блокировки аккаунта', example: null, nullable: true })
  @Column({ name: 'lockout_until', type: 'timestamptz', nullable: true })
  lockoutUntil: Date | null;

  @ApiProperty({ description: 'Дата создания аккаунта', example: '2026-06-06T12:00:00Z' })
  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата обновления аккаунта', example: '2026-06-06T13:00:00Z' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ApiPropertyOptional({ description: 'Дата мягкого удаления аккаунта', example: null, nullable: true })
  @Index()
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}

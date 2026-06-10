import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity('audit_log')
export class AuditLog {
  @ApiProperty({ description: 'ID лога аудита', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Имя пользователя, совершившего действие', example: 'admin' })
  @Column({ type: 'varchar', length: 255 })
  username: string;

  @ApiProperty({ description: 'Совершенное действие', example: 'UPDATE_SETTINGS' })
  @Index()
  @Column({ type: 'varchar', length: 100 })
  action: string;

  @ApiPropertyOptional({ description: 'Тип сущности, которую изменили', example: 'Settings' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  entityType: string;

  @ApiPropertyOptional({ description: 'ID измененной сущности', example: '1' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  entityId: string;

  @ApiPropertyOptional({ description: 'Дополнительные данные изменения (JSON строка)', example: '{"enableSounds": false}' })
  @Column({ type: 'text', nullable: true })
  payload: string;

  @ApiPropertyOptional({ description: 'IP-адрес отправителя запроса', example: '127.0.0.1' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  ip: string;

  @ApiProperty({ description: 'Дата и время действия', example: '2026-06-06T12:00:00Z' })
  @Index()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

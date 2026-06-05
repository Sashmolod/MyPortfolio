import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('audit_log')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  username: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  entityType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  entityId: string;

  @Column({ type: 'text', nullable: true })
  payload: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip: string;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}

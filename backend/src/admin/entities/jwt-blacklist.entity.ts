import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

@Entity('jwt_blacklist')
export class JwtBlacklist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ name: 'jti', type: 'varchar', length: 255 })
  jti: string;

  @Index()
  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt: Date;

  @Index()
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}

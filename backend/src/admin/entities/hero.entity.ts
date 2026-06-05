import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('hero')
export class Hero {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name: string;

  @Column({ name: 'title', type: 'varchar', length: 150 })
  title: string;

  @Column({ name: 'bio', type: 'text', default: '' })
  bio: string;

  @Column({ name: 'avatar', type: 'varchar', length: 255, default: '/favicon.svg' })
  avatar: string;

  @Column({ name: 'social_links_raw', type: 'text', nullable: true })
  socialLinksRaw: string;

  @Column({ name: 'social_links', type: 'text', nullable: true })
  socialLinks: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt: Date | null;
}

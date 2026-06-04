import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('hero')
export class Hero {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 150 })
  title: string;

  @Column({ type: 'text', default: '' })
  bio: string;

  @Column({ length: 255, default: '/favicon.svg' })
  avatar: string;

  @Column({ type: 'text', default: '{}' })
  socialLinks: string; // JSON: { github, linkedin, twitter }

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  // Геттеры/сеттеры для socialLinks
  getSocialLinks(): Record<string, string> {
    try {
      return typeof this.socialLinks === 'string' ? JSON.parse(this.socialLinks) : this.socialLinks;
    } catch {
      return {};
    }
  }

  setSocialLinks(links: Record<string, string>): void {
    this.socialLinks = JSON.stringify(links);
  }
}
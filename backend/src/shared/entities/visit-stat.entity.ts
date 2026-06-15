import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('visit_stats')
export class VisitStat {
  @ApiProperty({ description: 'ID записи о визите', example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'IP адрес посетителя', example: '192.168.1.1' })
  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @ApiProperty({ description: 'User-Agent', example: 'Mozilla/5.0...' })
  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @ApiProperty({ description: 'URL страницы', example: '/' })
  @Index()
  @Column({ name: 'path', type: 'varchar', length: 1000 })
  path: string;

  @ApiProperty({ description: 'Реферер', example: 'https://google.com' })
  @Column({ name: 'referrer', type: 'text', nullable: true })
  referrer: string;

  @ApiProperty({ description: 'Страна (из GeoIP)', example: 'UA' })
  @Column({ name: 'country', type: 'varchar', length: 10, nullable: true })
  country: string;

  @ApiProperty({ description: 'Браузер', example: 'Chrome' })
  @Column({ name: 'browser', type: 'varchar', length: 50, nullable: true })
  browser: string;

  @ApiProperty({ description: 'Операционная система', example: 'Windows' })
  @Column({ name: 'os', type: 'varchar', length: 50, nullable: true })
  os: string;

  @ApiProperty({ description: 'Тип устройства', example: 'desktop' })
  @Column({ name: 'device_type', type: 'varchar', length: 20, nullable: true })
  deviceType: string;

  @ApiProperty({ description: 'Дата и время визита', example: '2026-06-09T12:00:00Z' })
  @Index()
  @CreateDateColumn({ name: 'visited_at', type: 'timestamptz' })
  visitedAt: Date;
}
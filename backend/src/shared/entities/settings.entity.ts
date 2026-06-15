import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('settings')
export class Settings {
  @ApiProperty({ description: 'ID настроек (всегда равен 1)', example: 1 })
  @PrimaryColumn({ type: 'int', default: 1 })
  id: number = 1;

  @ApiProperty({ description: 'Включить виджет Doodly (ассистент скрепка)', example: true })
  @Column({ name: 'enable_doodly', type: 'boolean', default: true })
  enableDoodly: boolean;

  @ApiProperty({ description: 'Включить глобальные звуковые эффекты (Web Audio API)', example: true })
  @Column({ name: 'enable_sounds', type: 'boolean', default: true })
  enableSounds: boolean;

  @ApiProperty({ description: 'Включить пасхалку с ползающим жуком', example: true })
  @Column({ name: 'enable_bug', type: 'boolean', default: true })
  enableBug: boolean;

  @ApiProperty({ description: 'Включить пасхалку с надрывом страницы и игрой в крестики-нолики', example: true })
  @Column({ name: 'enable_page_tear', type: 'boolean', default: true })
  enablePageTear: boolean;

  @ApiProperty({ description: 'Включить пасхалку с утечкой чернил при двойном клике', example: true })
  @Column({ name: 'enable_ink_leak', type: 'boolean', default: true })
  enableInkLeak: boolean;

  @ApiProperty({ description: 'Включить интерактивную пролитую чашку кофе', example: true })
  @Column({ name: 'enable_coffee_spill', type: 'boolean', default: true })
  enableCoffeeSpill: boolean;

  @ApiProperty({ description: 'Включить анимацию рисования SVG контуров навыков при прокрутке', example: true })
  @Column({ name: 'enable_draw_skills', type: 'boolean', default: true })
  enableDrawSkills: boolean;

  @ApiProperty({ description: 'Включить инструмент интерактивного ластика для страницы', example: true })
  @Column({ name: 'enable_eraser', type: 'boolean', default: true })
  enableEraser: boolean;

  @ApiProperty({ description: 'Включить анимацию сминания бумаги при переходах между страницами', example: true })
  @Column({ name: 'enable_crumpled_page_transition', type: 'boolean', default: true })
  enableCrumpledPageTransition: boolean;

  @ApiProperty({ description: 'Показывать ссылку на панель управления (Админку) в шапке сайта', example: true })
  @Column({ name: 'show_admin_link', type: 'boolean', default: true })
  showAdminLink: boolean;

  @ApiProperty({ description: 'Дата последнего обновления настроек', example: '2026-06-06T12:00:00Z' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}

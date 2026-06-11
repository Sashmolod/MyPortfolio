import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  BaseEntity,
} from 'typeorm';
import { Skill } from './skill.entity';

@Entity('skill_category')
export class SkillCategory extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'int', nullable: true, name: 'parent_id' })
  parentId: number;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder: number;

  @ManyToOne(() => SkillCategory, { nullable: true })
  @JoinColumn({ name: 'parent_id', referencedColumnName: 'id' })
  parent?: SkillCategory;

  @OneToMany(() => SkillCategory, (cat) => cat.parent)
  subcategories?: SkillCategory[];

  @OneToMany(() => Skill, (skill) => skill.category)
  skills?: Skill[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

import { DataSource } from 'typeorm';
import { User } from './admin/entities/user.entity';
import { Hero } from './admin/entities/hero.entity';
import { Skill } from './admin/entities/skill.entity';
import { SkillCategory } from './admin/entities/skill-category.entity';
import { Project } from './admin/entities/project.entity';
import { ContactMessage } from './admin/entities/contact-message.entity';
import { SocialLink } from './admin/entities/social-link.entity';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envFile = process.env.NODE_ENV === 'production' ? '../.env.production' : '../.env.development';
dotenv.config({ path: path.resolve(__dirname, envFile) });

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'portfolio_db',
    entities: [User, Hero, Skill, SkillCategory, Project, ContactMessage, SocialLink],
    synchronize: false,
  });
  await dataSource.initialize();
  const skillCategoryRepo = dataSource.getRepository(SkillCategory);
  const skillRepo = dataSource.getRepository(Skill);
  const existingCategories = await skillCategoryRepo.count();
  let allCategories: SkillCategory[] = [];
  if (existingCategories === 0) {
    const roots = await skillCategoryRepo.save([
      skillCategoryRepo.create({ name: 'Frontend', parentId: null, sortOrder: 1 }),
      skillCategoryRepo.create({ name: 'Backend', parentId: null, sortOrder: 2 }),
      skillCategoryRepo.create({ name: 'DevOps', parentId: null, sortOrder: 3 }),
      skillCategoryRepo.create({ name: 'Languages', parentId: null, sortOrder: 4 }),
    ]);
    await skillCategoryRepo.save([
      skillCategoryRepo.create({ name: 'React', parentId: roots[0].id, sortOrder: 1 }),
      skillCategoryRepo.create({ name: 'Vue', parentId: roots[0].id, sortOrder: 2 }),
      skillCategoryRepo.create({ name: 'Angular', parentId: roots[0].id, sortOrder: 3 }),
      skillCategoryRepo.create({ name: 'Node.js', parentId: roots[1].id, sortOrder: 1 }),
      skillCategoryRepo.create({ name: 'NestJS', parentId: roots[1].id, sortOrder: 2 }),
      skillCategoryRepo.create({ name: 'Express', parentId: roots[1].id, sortOrder: 3 }),
      skillCategoryRepo.create({ name: 'Docker', parentId: roots[2].id, sortOrder: 1 }),
      skillCategoryRepo.create({ name: 'Kubernetes', parentId: roots[2].id, sortOrder: 2 }),
      skillCategoryRepo.create({ name: 'JavaScript', parentId: roots[3].id, sortOrder: 1 }),
      skillCategoryRepo.create({ name: 'TypeScript', parentId: roots[3].id, sortOrder: 2 }),
      skillCategoryRepo.create({ name: 'Python', parentId: roots[3].id, sortOrder: 3 }),
    ]);
    allCategories = [...roots, ...await skillCategoryRepo.createQueryBuilder().where('parentId IS NOT NULL').getMany()];
  } else {
    allCategories = await skillCategoryRepo.find();
  }
  const existingSkills = await skillRepo.count();
  if (existingSkills === 0) {
    const catMap = new Map<string, number>();
    allCategories.forEach((c) => { catMap.set(c.parentId ? c.parentId + ':' + c.name : c.name, c.id); });
    const skills = [
      { n: 'JavaScript', i: 'js', d: 'ES6+, TypeScript', l: 90, s: 1, ci: catMap.get('4:JavaScript'), sci: null },
      { n: 'TypeScript', i: 'ts', d: 'Type-safe JavaScript', l: 90, s: 2, ci: catMap.get('4:TypeScript'), sci: null },
      { n: 'React', i: 'react', d: 'Hooks, Redux, Context API', l: 85, s: 3, ci: catMap.get('1:React'), sci: null },
      { n: 'Vue', i: 'vue', d: 'Vue 3, Composition API', l: 70, s: 4, ci: catMap.get('1:Vue'), sci: null },
      { n: 'Angular', i: 'angular', d: 'Angular 16+, RxJS', l: 60, s: 5, ci: catMap.get('1:Angular'), sci: null },
      { n: 'Node.js', i: 'node', d: 'Express, NestJS', l: 80, s: 6, ci: catMap.get('2:Node.js'), sci: null },
      { n: 'NestJS', i: 'nestjs', d: 'Enterprise-grade backend', l: 75, s: 7, ci: catMap.get('2:NestJS'), sci: null },
      { n: 'Python', i: 'python', d: 'Django, Flask', l: 75, s: 8, ci: catMap.get('4:Python'), sci: null },
      { n: 'Docker', i: 'docker', d: 'Containerization', l: 65, s: 9, ci: catMap.get('3:Docker'), sci: null },
      { n: 'Kubernetes', i: 'k8s', d: 'Container orchestration', l: 50, s: 10, ci: catMap.get('3:Kubernetes'), sci: null },
    ];
    await skillRepo.save(skills.map((sk) => skillRepo.create({ name: sk.n, icon: sk.i, description: sk.d, level: sk.l, sortOrder: sk.s, categoryId: sk.ci || null, subcategoryId: sk.sci })));
    console.log('Skills seeded');
  } else {
    console.log('Skills already exist');
  }
  await dataSource.destroy();
  console.log('Seed completed');
}
seed().catch(console.error);
import { DataSource } from 'typeorm';
import { User } from './admin/entities/user.entity';
import { Hero } from './admin/entities/hero.entity';
import { Skill } from './admin/entities/skill.entity';
import { SkillCategory } from './admin/entities/skill-category.entity';
import { Project } from './admin/entities/project.entity';
import { ContactMessage } from './admin/entities/contact-message.entity';
import { SocialLink } from './admin/entities/social-link.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envFile = process.env.NODE_ENV === 'production' ? '../.env.production' : '../.env.development';
dotenv.config({ path: path.resolve(__dirname, envFile) });

// Default skills data organized by category/subcategory name
const DEFAULT_SKILLS_BY_NAME: Record<string, Array<{ name: string; icon: string; description: string; level: number; sortOrder: number }>> = {
  'Backend': [
    { name: 'Node.js', icon: 'node', description: 'Express, Fastify', level: 85, sortOrder: 1 },
    { name: 'SQL', icon: 'sql', description: 'PostgreSQL, MySQL', level: 80, sortOrder: 2 },
  ],
  'DevOps': [
    { name: 'Docker', icon: 'docker', description: 'Containerization', level: 70, sortOrder: 1 },
  ],
  'Languages': [
    { name: 'JavaScript', icon: 'js', description: 'ES6+, TypeScript', level: 95, sortOrder: 1 },
    { name: 'TypeScript', icon: 'ts', description: 'Type-safe JavaScript', level: 90, sortOrder: 2 },
    { name: 'Python', icon: 'python', description: 'Django, Flask', level: 75, sortOrder: 3 },
    { name: 'Java', icon: 'java', description: 'Spring Boot', level: 60, sortOrder: 4 },
    { name: 'PHP', icon: 'php', description: 'Laravel, Symfony', level: 50, sortOrder: 5 },
    { name: 'C++', icon: 'cpp', description: 'Systems programming', level: 45, sortOrder: 6 },
  ],
  'React': [
    { name: 'React', icon: 'react', description: 'Hooks, Redux, Context API', level: 90, sortOrder: 1 },
  ],
  'Vue': [
    { name: 'Vue.js', icon: 'vue', description: 'Vue 3, Composition API', level: 70, sortOrder: 1 },
  ],
  'Angular': [
    { name: 'Angular', icon: 'angular', description: 'Angular 16+, RxJS', level: 60, sortOrder: 1 },
  ],
  'NestJS': [
    { name: 'NestJS', icon: 'nestjs', description: 'Enterprise-grade backend', level: 75, sortOrder: 1 },
  ],
  'Kubernetes': [
    { name: 'Kubernetes', icon: 'k8s', description: 'Container orchestration', level: 55, sortOrder: 1 },
  ],
};

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
    console.log('No categories found, creating default categories...');
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
      skillCategoryRepo.create({ name: 'Docker', parentId: roots[2].id, sortOrder: 1 }),
      skillCategoryRepo.create({ name: 'Kubernetes', parentId: roots[2].id, sortOrder: 2 }),
      skillCategoryRepo.create({ name: 'JavaScript', parentId: roots[3].id, sortOrder: 1 }),
      skillCategoryRepo.create({ name: 'TypeScript', parentId: roots[3].id, sortOrder: 2 }),
    ]);
    allCategories = await skillCategoryRepo.find({ order: { sortOrder: 'ASC' } });
  } else {
    console.log('Reading existing categories from database...');
    allCategories = await skillCategoryRepo.find({ order: { sortOrder: 'ASC' } });
  }

  console.log(`Found ${allCategories.length} categories in database.`);
  for (const cat of allCategories) {
    console.log(`  - Category ${cat.id}: ${cat.name} (parentId: ${cat.parentId})`);
  }

  await skillRepo.clear();
  console.log('Cleared existing skills.');

  const skillsToCreate: Array<{ name: string; icon: string; description: string; level: number; sortOrder: number; categoryId: number; subcategoryId: number | null }> = [];

  for (const category of allCategories) {
    const skillsForCategory = DEFAULT_SKILLS_BY_NAME[category.name];
    if (skillsForCategory) {
      for (const skillData of skillsForCategory) {
        if (category.parentId) {
          skillsToCreate.push({
            ...skillData,
            categoryId: category.parentId,
            subcategoryId: category.id,
          });
        } else {
          skillsToCreate.push({
            ...skillData,
            categoryId: category.id,
            subcategoryId: null,
          });
        }
      }
    }
  }

  await skillRepo.save(skillsToCreate.map(data => skillRepo.create(data)));
  console.log(`Seeded ${skillsToCreate.length} skills.`);

  await dataSource.destroy();
  console.log('Seed completed.');
}

seed().catch(err => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
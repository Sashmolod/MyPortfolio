import { DataSource } from 'typeorm';
import { User } from './admin/entities/user.entity';
import { Hero } from './admin/entities/hero.entity';
import { Skill } from './admin/entities/skill.entity';
import { Project } from './admin/entities/project.entity';
import { ContactMessage } from './admin/entities/contact-message.entity';
import { SocialLink } from './admin/entities/social-link.entity';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envFile = process.env.NODE_ENV === 'production' ? '../.env.prod' : '../.env.dev';
dotenv.config({ path: path.resolve(__dirname, envFile) });


const SALT_ROUNDS = 10;

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    database: process.env.POSTGRES_DB || 'portfolio_db',
    entities: [User, Hero, Skill, Project, ContactMessage, SocialLink],
    synchronize: false, // Используем миграции!
  });

  await dataSource.initialize();
  console.log('Connected to database:', process.env.POSTGRES_DB);

  const userRepo = dataSource.getRepository(User);
  const heroRepo = dataSource.getRepository(Hero);
  const skillRepo = dataSource.getRepository(Skill);
  const projectRepo = dataSource.getRepository(Project);
  const contactRepo = dataSource.getRepository(ContactMessage);
  const socialLinkRepo = dataSource.getRepository(SocialLink);

  // ==================== Seed Users ====================
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const existingAdmin = await userRepo.findOne({ where: { username: adminUsername } });
  
  if (!existingAdmin) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    // Если ADMIN_PASSWORD не установлен — предупреждение и генерация случайного пароля
    if (!adminPassword || adminPassword.trim() === '') {
      const randomPassword = Math.random().toString(36).slice(-12);
      console.warn('⚠️  ADMIN_PASSWORD не установлен. Генерируется случайный пароль:', randomPassword);
      console.warn('⚠️  Установите ADMIN_PASSWORD в .env файле для production!');
      const hashedPassword = await bcrypt.hash(randomPassword, SALT_ROUNDS);
      const admin = userRepo.create({
        username: adminUsername,
        password: hashedPassword,
        isActive: true,
      });
      await userRepo.save(admin);
      console.log('✅ Admin user created with generated password:', adminUsername);
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);
      const admin = userRepo.create({
        username: adminUsername,
        password: hashedPassword,
        isActive: true,
      });
      await userRepo.save(admin);
      console.log('✅ Admin user created:', adminUsername);
    }
  } else {
    console.log('ℹ️  Admin user already exists');
  }

  // ==================== Seed Hero ====================
  const existingHero = await heroRepo.findOne({ where: { name: 'Your Name' } });
  
  if (!existingHero) {
    const hero = heroRepo.create({
      name: 'Your Name',
      title: 'Full-Stack Developer',
      bio: 'I build things for the web and beyond.',
      avatar: '/hero_avatar.png',
    });
    await heroRepo.save(hero);
    console.log('✅ Hero data seeded');
  } else {
    console.log('ℹ️  Hero data already exists');
  }

  // ==================== Seed Social Links ====================
  const existingSocialLinks = await socialLinkRepo.count();
  
  if (existingSocialLinks === 0) {
    await socialLinkRepo.save([
      socialLinkRepo.create({ platform: 'GitHub', url: 'https://github.com/yourusername', sortOrder: 1 }),
      socialLinkRepo.create({ platform: 'LinkedIn', url: 'https://linkedin.com/in/yourusername', sortOrder: 2 }),
      socialLinkRepo.create({ platform: 'Twitter', url: 'https://twitter.com/yourusername', sortOrder: 3 }),
    ]);
    console.log('✅ Social links seeded');
  } else {
    console.log('ℹ️  Social links already exist');
  }

  // ==================== Seed Skills ====================
  const existingSkills = await skillRepo.count();
  
  if (existingSkills === 0) {
    await skillRepo.save([
      skillRepo.create({ name: 'JavaScript', icon: 'js', description: 'ES6+, TypeScript', level: 90, sortOrder: 1 }),
      skillRepo.create({ name: 'React', icon: 'react', description: 'Hooks, Redux, Context API', level: 85, sortOrder: 2 }),
      skillRepo.create({ name: 'Node.js', icon: 'node', description: 'Express, NestJS', level: 80, sortOrder: 3 }),
      skillRepo.create({ name: 'Python', icon: 'python', description: 'Django, Flask', level: 75, sortOrder: 4 }),
      skillRepo.create({ name: 'SQL', icon: 'sql', description: 'PostgreSQL, MySQL, SQLite', level: 70, sortOrder: 5 }),
      skillRepo.create({ name: 'Docker', icon: 'docker', description: 'Containerization', level: 65, sortOrder: 6 }),
    ]);
    console.log('✅ Skills seeded');
  } else {
    console.log('ℹ️  Skills already exist');
  }

  // ==================== Seed Projects ====================
  const existingProjects = await projectRepo.count();
  
  if (existingProjects === 0) {
    await projectRepo.save([
      projectRepo.create({
        title: 'Portfolio Website',
        description: 'A personal portfolio website built with React and Vite.',
        image: '/portfolio.png',
        link: 'https://github.com/example/portfolio',
        technologies: 'React, Vite, CSS',
        sortOrder: 1,
      }),
      projectRepo.create({
        title: 'E-Commerce App',
        description: 'Full-stack e-commerce application with payment integration.',
        image: '/ecommerce.png',
        link: 'https://github.com/example/ecommerce',
        technologies: 'React, Node.js, MongoDB, Stripe',
        sortOrder: 2,
      }),
      projectRepo.create({
        title: 'Task Manager API',
        description: 'RESTful API for task management with authentication.',
        image: '/taskmanager.png',
        link: 'https://github.com/example/task-manager',
        technologies: 'Node.js, Express, PostgreSQL, JWT',
        sortOrder: 3,
      }),
    ]);
    console.log('✅ Projects seeded');
  } else {
    console.log('ℹ️  Projects already exist');
  }

  // ==================== Seed Contact Messages ====================
  const existingMessages = await contactRepo.count();
  
  if (existingMessages === 0) {
    await contactRepo.save([
      contactRepo.create({
        name: 'Test User',
        email: 'test@example.com',
        subject: 'Test Message',
        message: 'This is a test contact message.',
      }),
    ]);
    console.log('✅ Contact messages seeded');
  } else {
    console.log('ℹ️  Contact messages already exist');
  }

  await dataSource.destroy();
  console.log('🎉 Seed completed successfully!');
}

seed().catch(console.error);
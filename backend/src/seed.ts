import { DataSource } from 'typeorm';
import { User, Hero, Skill, SkillCategory, Project, ContactMessage, SocialLink } from './shared/entities';
import * as dotenv from 'dotenv';
import * as path from 'path';

const envFile = process.env.NODE_ENV === 'production' ? '../.env.production' : '../.env.development';
dotenv.config({ path: path.resolve(__dirname, envFile) });

interface CategorySeed {
  name: string;
  sortOrder: number;
  subcategories: Array<{ name: string; sortOrder: number }>;
}

const CATEGORY_TREE: CategorySeed[] = [
  {
    name: 'Frontend',
    sortOrder: 1,
    subcategories: [
      { name: 'Basics', sortOrder: 0 },
      { name: 'Styles', sortOrder: 0 },
      { name: 'Frameworks', sortOrder: 0 },
    ],
  },
  {
    name: 'Backend',
    sortOrder: 2,
    subcategories: [
      { name: 'Technology', sortOrder: 0 },
    ],
  },
  {
    name: 'DevOps',
    sortOrder: 3,
    subcategories: [
      { name: 'Infrastructure', sortOrder: 0 },
      { name: 'Automation', sortOrder: 0 },
      { name: 'Virtualization', sortOrder: 0 },
    ],
  },
  {
    name: 'Languages',
    sortOrder: 4,
    subcategories: [],
  },
  {
    name: 'Mobile App',
    sortOrder: 0,
    subcategories: [
      { name: 'Android', sortOrder: 0 },
      { name: 'iOs', sortOrder: 0 },
      { name: 'CrossPlatform', sortOrder: 0 },
    ],
  },
  {
    name: 'DataBase',
    sortOrder: 0,
    subcategories: [
      { name: 'rdbms', sortOrder: 0 },
      { name: 'nosql', sortOrder: 0 },
      { name: 'Graph', sortOrder: 0 },
      { name: 'Messge Queues', sortOrder: 0 },
    ],
  },
];

interface SkillSeed {
  name: string;
  icon: string;
  description: string;
  level: number;
  sortOrder: number;
  categoryName: string;
  subcategoryName: string | null;
}

const DEFAULT_SKILLS: SkillSeed[] = [
  { name: 'Java', icon: 'java', description: '', level: 90, sortOrder: 1, categoryName: 'Mobile App', subcategoryName: 'Android' },
  { name: 'React', icon: 'react', description: 'Hooks, Redux, Context API', level: 85, sortOrder: 2, categoryName: 'Frontend', subcategoryName: 'Frameworks' },
  { name: 'Node.js', icon: 'node', description: 'Express, NestJS', level: 80, sortOrder: 3, categoryName: 'Backend', subcategoryName: 'Technology' },
  { name: 'Python', icon: 'python', description: 'Django, Flask', level: 75, sortOrder: 4, categoryName: 'Backend', subcategoryName: 'Technology' },
  { name: 'MySQL', icon: 'mysql', description: 'PostgreSQL, MySQL, SQLite', level: 70, sortOrder: 5, categoryName: 'Backend', subcategoryName: 'Technology' },
  { name: 'Docker', icon: 'docker', description: 'Containerization', level: 65, sortOrder: 6, categoryName: 'DevOps', subcategoryName: 'Virtualization' },
  { name: 'OrbStack', icon: 'docker', description: 'OrbStack', level: 50, sortOrder: 0, categoryName: 'DevOps', subcategoryName: null },
  { name: 'C++', icon: 'c++', description: '', level: 50, sortOrder: 0, categoryName: 'Backend', subcategoryName: 'Technology' },
  { name: 'PHP', icon: 'php', description: '', level: 50, sortOrder: 0, categoryName: 'Backend', subcategoryName: 'Technology' },
  { name: 'WEBPACK', icon: 'webpack', description: '', level: 50, sortOrder: 0, categoryName: 'Frontend', subcategoryName: 'Frameworks' },
  { name: 'BOOTSTRAP', icon: 'bootstrap', description: '', level: 50, sortOrder: 0, categoryName: 'Frontend', subcategoryName: 'Styles' },
  { name: 'Java', icon: 'java', description: '', level: 50, sortOrder: 0, categoryName: 'Frontend', subcategoryName: 'Basics' },
  { name: 'HTML', icon: 'html', description: '', level: 50, sortOrder: 0, categoryName: 'Frontend', subcategoryName: 'Basics' },
  { name: 'CSS', icon: 'css', description: '', level: 50, sortOrder: 0, categoryName: 'Frontend', subcategoryName: 'Basics' },
  { name: 'Unity', icon: 'unity', description: '', level: 50, sortOrder: 0, categoryName: 'Mobile App', subcategoryName: 'CrossPlatform' },
  { name: 'xamarin', icon: 'xamarin', description: '', level: 50, sortOrder: 0, categoryName: 'Mobile App', subcategoryName: 'CrossPlatform' },
  { name: 'pwa', icon: 'pwa', description: '', level: 50, sortOrder: 0, categoryName: 'Mobile App', subcategoryName: 'CrossPlatform' },
  { name: 'ionic', icon: 'ionic', description: '', level: 50, sortOrder: 0, categoryName: 'Mobile App', subcategoryName: 'CrossPlatform' },
  { name: 'react native', icon: 'reactnative', description: '', level: 50, sortOrder: 0, categoryName: 'Mobile App', subcategoryName: 'CrossPlatform' },
  { name: 'swift', icon: 'swift', description: '', level: 50, sortOrder: 0, categoryName: 'Mobile App', subcategoryName: 'iOs' },
  { name: 'Objective C', icon: 'objective c', description: '', level: 50, sortOrder: 0, categoryName: 'Mobile App', subcategoryName: 'iOs' },
  { name: 'SDK', icon: 'sdk', description: '', level: 50, sortOrder: 0, categoryName: 'Mobile App', subcategoryName: 'Android' },
  { name: 'NGINX', icon: 'nginx', description: '', level: 50, sortOrder: 0, categoryName: 'DevOps', subcategoryName: 'Infrastructure' },
  { name: 'AWS', icon: 'aws', description: '', level: 50, sortOrder: 0, categoryName: 'DevOps', subcategoryName: 'Infrastructure' },
  { name: 'Azure', icon: 'azure', description: '', level: 50, sortOrder: 0, categoryName: 'DevOps', subcategoryName: 'Infrastructure' },
  { name: 'ELK', icon: 'elk', description: '', level: 50, sortOrder: 0, categoryName: 'DevOps', subcategoryName: 'Infrastructure' },
  { name: 'Ansible', icon: 'ansible', description: '', level: 50, sortOrder: 0, categoryName: 'DevOps', subcategoryName: 'Automation' },
  { name: 'Chef', icon: 'chef', description: '', level: 50, sortOrder: 0, categoryName: 'DevOps', subcategoryName: 'Automation' },
  { name: 'Jenkins', icon: 'jenkins', description: '', level: 50, sortOrder: 0, categoryName: 'DevOps', subcategoryName: 'Automation' },
  { name: 'Kubernetes', icon: 'kubernetes', description: '', level: 50, sortOrder: 0, categoryName: 'DevOps', subcategoryName: 'Virtualization' },
  { name: 'Vagrant', icon: 'vagrant', description: '', level: 50, sortOrder: 0, categoryName: 'DevOps', subcategoryName: 'Virtualization' },
  { name: 'VMWare', icon: 'vmware', description: '', level: 50, sortOrder: 0, categoryName: 'DevOps', subcategoryName: 'Virtualization' },
  { name: 'Postgres', icon: 'postgres', description: '', level: 50, sortOrder: 0, categoryName: 'DataBase', subcategoryName: 'rdbms' },
  { name: 'MSSQL', icon: 'mssql', description: '', level: 50, sortOrder: 0, categoryName: 'DataBase', subcategoryName: 'rdbms' },
  { name: 'Mongo', icon: 'mongo', description: '', level: 50, sortOrder: 0, categoryName: 'DataBase', subcategoryName: 'nosql' },
  { name: 'Redis', icon: 'redis', description: '', level: 50, sortOrder: 0, categoryName: 'Backend', subcategoryName: 'Technology' },
  { name: 'ASP.NET', icon: 'asp.net', description: '', level: 50, sortOrder: 0, categoryName: 'Backend', subcategoryName: 'Technology' },
  { name: 'Java (Spring)', icon: 'java (spring)', description: '', level: 50, sortOrder: 0, categoryName: 'Backend', subcategoryName: 'Technology' },
  { name: 'Ruby on Rails', icon: 'ruby on rails', description: '', level: 50, sortOrder: 0, categoryName: 'Backend', subcategoryName: 'Technology' },
  { name: 'Node', icon: 'node', description: '', level: 50, sortOrder: 0, categoryName: 'Backend', subcategoryName: 'Technology' },
  { name: 'Material UI', icon: 'material ui', description: '', level: 50, sortOrder: 0, categoryName: 'Frontend', subcategoryName: 'Styles' },
  { name: 'Vue', icon: 'vue', description: '', level: 50, sortOrder: 0, categoryName: 'Frontend', subcategoryName: 'Frameworks' },
  { name: 'Angular', icon: 'angular', description: '', level: 50, sortOrder: 0, categoryName: 'Frontend', subcategoryName: 'Frameworks' },
  { name: 'Cassandra', icon: 'cassandra', description: '', level: 50, sortOrder: 0, categoryName: 'DataBase', subcategoryName: 'nosql' },
  { name: 'CouchDB', icon: 'couchdb', description: '', level: 50, sortOrder: 0, categoryName: 'DataBase', subcategoryName: 'nosql' },
  { name: 'Elasticsearch', icon: 'elasticsearch', description: '', level: 50, sortOrder: 0, categoryName: 'DataBase', subcategoryName: 'nosql' },
  { name: 'Neo4j', icon: 'neo4j', description: '', level: 50, sortOrder: 0, categoryName: 'DataBase', subcategoryName: 'Graph' },
  { name: 'ArangoDB', icon: 'arangodb', description: '', level: 50, sortOrder: 0, categoryName: 'DataBase', subcategoryName: 'Graph' },
  { name: 'Kafka', icon: 'kafka', description: '', level: 50, sortOrder: 0, categoryName: 'DataBase', subcategoryName: 'Messge Queues' },
  { name: 'SQS', icon: 'sqs', description: '', level: 50, sortOrder: 0, categoryName: 'DataBase', subcategoryName: 'Messge Queues' },
  { name: 'ZeroMQ', icon: 'zeromq', description: '', level: 50, sortOrder: 0, categoryName: 'DataBase', subcategoryName: 'Messge Queues' },
  { name: 'RabbitMQ', icon: 'rabbitmq', description: '', level: 50, sortOrder: 0, categoryName: 'DataBase', subcategoryName: 'Messge Queues' },
];

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

  // 1. Очистка старых данных (сначала навыки, затем категории)
  await skillRepo.createQueryBuilder().delete().execute();
  console.log('Cleared existing skills.');

  await skillCategoryRepo.createQueryBuilder().delete().execute();
  console.log('Cleared existing categories.');

  // 2. Сидинг категорий и создание структуры дерева
  console.log('Creating skill categories tree...');
  const rootCategoriesMap: Record<string, SkillCategory> = {};
  const subcategoriesMap: Record<string, SkillCategory> = {};

  for (const rootCatData of CATEGORY_TREE) {
    const rootCat = await skillCategoryRepo.save(
      skillCategoryRepo.create({
        name: rootCatData.name,
        sortOrder: rootCatData.sortOrder,
        parentId: null,
      })
    );
    rootCategoriesMap[rootCat.name] = rootCat;
    console.log(`  - Root Category created: ${rootCat.name} (id: ${rootCat.id})`);

    for (const subCatData of rootCatData.subcategories) {
      const subCat = await skillCategoryRepo.save(
        skillCategoryRepo.create({
          name: subCatData.name,
          sortOrder: subCatData.sortOrder,
          parentId: rootCat.id,
        })
      );
      // Ключ в мапе: "ИмяРодителя:ИмяПодкатегории" для однозначного определения
      const mapKey = `${rootCatData.name}:${subCatData.name}`;
      subcategoriesMap[mapKey] = subCat;
      console.log(`    * Subcategory created: ${subCat.name} (id: ${subCat.id}, parentId: ${rootCat.id})`);
    }
  }

  // 3. Сидинг навыков с привязкой к созданным категориям
  console.log('Seeding skills...');
  const skillsToCreate = DEFAULT_SKILLS.map((skillData) => {
    const parentCategory = rootCategoriesMap[skillData.categoryName];
    if (!parentCategory) {
      throw new Error(`Category "${skillData.categoryName}" not found in CATEGORY_TREE.`);
    }

    let subcategory: SkillCategory | null = null;
    if (skillData.subcategoryName) {
      const mapKey = `${skillData.categoryName}:${skillData.subcategoryName}`;
      subcategory = subcategoriesMap[mapKey];
      if (!subcategory) {
        throw new Error(`Subcategory "${skillData.subcategoryName}" under category "${skillData.categoryName}" not found in CATEGORY_TREE.`);
      }
    }

    return skillRepo.create({
      name: skillData.name,
      icon: skillData.icon,
      description: skillData.description,
      level: skillData.level,
      sortOrder: skillData.sortOrder,
      categoryId: parentCategory.id,
      subcategoryId: subcategory ? subcategory.id : null,
    });
  });

  await skillRepo.save(skillsToCreate);
  console.log(`Seeded ${skillsToCreate.length} skills successfully.`);

  await dataSource.destroy();
  console.log('Seed completed.');
}

seed().catch((err) => {
  console.error('Error seeding database:', err);
  process.exit(1);
});
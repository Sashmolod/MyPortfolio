import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Загружаем .env из папки backend (migration команды могут запускаться из корня)
const envPath = path.resolve(__dirname, '../.env');
dotenv.config({ path: envPath });

export default new DataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'portfolio_db',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/*.{.ts,.js}'],
  synchronize: false,
});
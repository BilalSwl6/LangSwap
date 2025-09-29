import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_DATABASE || 'myapp',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [
    join(__dirname, '../**/*.entity.{ts,js}'),
    join(__dirname, '../**/entities/*.{ts,js}'),
  ],
  migrations: [join(__dirname, './migrations/*.{ts,js}')],
  synchronize: !isProduction,
  logging: !isProduction ? ['query', 'error'] : false,
  migrationsRun: isProduction,
};

export const AppDataSource = new DataSource(dataSourceOptions);

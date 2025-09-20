import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import * as dotenv from 'dotenv';

// load .env before anything else
dotenv.config();

const DB_PROVIDER = process.env.DB_PROVIDER || 'postgres';

let dataSourceOptions: DataSourceOptions;

if (DB_PROVIDER === 'postgres') {
  dataSourceOptions = {
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
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production' ? ['query', 'error'] : false,
    migrationsRun: process.env.NODE_ENV === 'production',
  };
} else {
  dataSourceOptions = {
    type: 'sqlite',
    database: process.env.DB_PATH || 'database.sqlite',
    entities: [
      join(__dirname, '../**/*.entity.{ts,js}'),
      join(__dirname, '../**/entities/*.{ts,js}'),
    ],
    migrations: [join(__dirname, './migrations/*.{ts,js}')],
    synchronize: false,
    logging: ['query', 'error'],
    migrationsRun: false,
  };
}

export const AppDataSource = new DataSource(dataSourceOptions);

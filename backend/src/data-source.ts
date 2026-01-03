import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

// Dynamic SSL configuration based on environment variable
const useSSL = process.env.DATABASE_SSL !== 'false';
const sslConfig: any = {};
if (useSSL) {
    sslConfig.ssl = process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: true }
        : { rejectUnauthorized: false };
}

export const AppDataSource = new DataSource({
    type: 'postgres',
    ...sslConfig,
    url: process.env.DATABASE_URL,
    schema: process.env.DATABASE_SCHEMA || 'public',
    synchronize: false,
    logging: true,
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/migrations/**/*.js'],
    subscribers: [],
});

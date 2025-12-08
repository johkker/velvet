import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const sslConfig = process.env.NODE_ENV === "production"
    ? {
        ssl: {
            rejectUnauthorized: true,
        },
    }
    : {
        // Configuração para Desenvolvimento/Local: ATIVA o SSL e DESATIVA a validação do certificado
        ssl: {
            rejectUnauthorized: false,
        },
    };

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

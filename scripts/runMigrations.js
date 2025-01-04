import { config } from 'dotenv';
import { runMigrations } from '../db/utils/migrationRunner.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

config();

const dbConfig = {
    local: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    vps: {
        host: process.env.VPS_DB_HOST,
        user: process.env.VPS_DB_USER,
        password: process.env.VPS_DB_PASSWORD,
        database: process.env.VPS_DB_NAME
    }
};

const migrationDir = path.join(__dirname, '..', 'db', 'migrations');

runMigrations(dbConfig, migrationDir)
    .then(() => console.log('Migrations completed successfully'))
    .catch(error => {
        console.error('Migration failed:', error);
        process.exit(1);
    });

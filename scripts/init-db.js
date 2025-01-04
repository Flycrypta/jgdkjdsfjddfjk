import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function initializeDatabase() {
    const dbPath = process.env.DATABASE_PATH || join(__dirname, '..', 'db', 'botData.db');
    
    try {
        const db = new Database(dbPath, { 
            verbose: console.log 
        });
        
        console.log('Connected to database at:', dbPath);

        // Enable foreign keys
        db.pragma('foreign_keys = ON');

        // Read and execute migration files
        const migrations = ['01_initial.sql', '02_items.sql', '03_user_data.sql', '04_create_user_stats.sql']
            .map(file => readFileSync(join(__dirname, '..', 'db', 'migrations', file), 'utf8'));

        for (const migration of migrations) {
            db.exec(migration);
        }

        console.log('Database initialized successfully');
        db.close();
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

initializeDatabase();

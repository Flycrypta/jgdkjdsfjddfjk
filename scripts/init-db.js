import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

async function initializeDatabase() {
    const db = new Database(process.env.DATABASE_PATH);
    
    try {
        // Read and execute all migration files in order
        const migrations = ['01_initial.sql', '02_items.sql', '03_user_data.sql', '04_create_user_stats.sql']
            .map(file => readFileSync(join(process.cwd(), 'db', 'migrations', file), 'utf8'));

        db.pragma('foreign_keys = ON');

        migrations.forEach(migration => {
            db.exec(migration);
        });

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}

initializeDatabase();

import { Logger } from '../utils/logger.js';
import { DatabaseManager } from '../db/managers/DatabaseManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const log = new Logger('DatabaseInit');
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function initializeDatabase() {
    try {
        const dbPath = path.join(__dirname, '..', 'data', 'bot.db');
        const dbManager = new DatabaseManager(dbPath);
        await dbManager.initialize();
        log.info('Database initialized successfully');
        return dbManager;
    } catch (error) {
        log.error('Failed to initialize database:', error);
        throw error;
    }
}

async function warmupCache(dbManager) {
    const queries = [
        'SELECT * FROM items WHERE rarity = "common"',
        'SELECT * FROM cars WHERE base_price < 100000',
        // Add more common queries
    ];

    for (const query of queries) {
        await dbManager.executeQuery(query, [], { useCache: true });
    }
}

// Export only once
export { initializeDatabase };

import { Logger } from '../../utils/logger.js';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

const log = new Logger('MigrationRunner');

export async function runMigrations(dbConfig, migrationDir) {
    // Validate VPS credentials
    if (dbConfig.vps.password !== 'buttercup519') {
        throw new Error('Invalid VPS database credentials');
    }

    const connections = {
        local: await mysql.createConnection(dbConfig.local),
        vps: await mysql.createConnection(dbConfig.vps)
    };

    try {
        // Create migrations table if it doesn't exist
        for (const [name, conn] of Object.entries(connections)) {
            await conn.query(`
                CREATE TABLE IF NOT EXISTS migrations (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(255) NOT NULL UNIQUE,
                    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            log.info(`Created migrations table on ${name} database`);
        }

        // Get and sort migration files
        const files = await fs.readdir(migrationDir);
        const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();

        // Run each migration on both databases
        for (const file of sqlFiles) {
            const sql = await fs.readFile(path.join(migrationDir, file), 'utf8');

            for (const [name, conn] of Object.entries(connections)) {
                const [rows] = await conn.query(
                    'SELECT * FROM migrations WHERE name = ?',
                    [file]
                );

                if (rows.length === 0) {
                    await conn.query('START TRANSACTION');
                    try {
                        await conn.query(sql);
                        await conn.query(
                            'INSERT INTO migrations (name) VALUES (?)',
                            [file]
                        );
                        await conn.query('COMMIT');
                        log.info(`Migration ${file} executed on ${name} database`);
                    } catch (error) {
                        await conn.query('ROLLBACK');
                        throw error;
                    }
                } else {
                    log.info(`Migration ${file} already executed on ${name} database`);
                }
            }
        }
    } finally {
        // Close connections
        await Promise.all(Object.values(connections).map(conn => conn.end()));
    }
}

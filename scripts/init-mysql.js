
import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import { Logger } from '../utils/logger.js';

const log = new Logger('DatabaseInit');

async function initializeDatabase() {
    try {
        // Create database connection
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        // Create database if it doesn't exist
        await connection.execute(
            `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`
        );

        log.info('Database initialized successfully');
        await connection.end();
    } catch (error) {
        log.error('Failed to initialize database:', error);
        throw error;
    }
}

initializeDatabase().catch(console.error);
import Database from 'better-sqlite3';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';
import { createHash } from 'crypto';
import { Logger } from '../../utils/logger.js';
import { DatabaseError } from '../errors/DatabaseError.js';
import { BackupManager } from './BackupManager.js';
import { validateMigration } from '../validators/MigrationValidator.js';
import { readdir } from 'fs/promises';
import { readFileSync } from 'fs';

const log = new Logger('DatabaseManager');

export class DatabaseManager {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.logger = new Logger('DatabaseManager');
        this.backupManager = new BackupManager(dbPath);
        this.statements = new Map();
        this.migrationHistory = new Map();
    }

    async initialize() {
        try {
            this.db = new Database(this.dbPath);
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('foreign_keys = ON');

            await this.setupDatabase();
            await this.createBackupIfNeeded();
            this.prepareStatements();

            log.info('Database initialized successfully');
        } catch (error) {
            log.error('Database initialization failed:', error);
            await this.handleInitializationError(error);
            throw error;
        }
    }

    async setupDatabase() {
        try {
            await this.runMigrations();
        } catch (error) {
            throw new DatabaseError('Failed to set up the database', { cause: error });
        }
    }

    async ensureDatabaseDirectory() {
        const dir = dirname(this.dbPath);
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (error) {
            throw new DatabaseError('Failed to create database directory', { cause: error });
        }
    }

    async connectToDatabase() {
        try {
            this.db = new Database(this.dbPath, {
                verbose: process.env.NODE_ENV === 'development' ? console.log : null,
                fileMustExist: false
            });

            // Optimize database settings
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('synchronous = NORMAL');
            this.db.pragma('foreign_keys = ON');
            this.db.pragma('auto_vacuum = INCREMENTAL');
            this.db.pragma('cache_size = -2000'); // 2MB cache

        } catch (error) {
            throw new DatabaseError('Failed to connect to database', { cause: error });
        }
    }

    async validateDatabaseIntegrity() {
        const integrityCheck = this.db.prepare('PRAGMA integrity_check').get();
        if (integrityCheck.integrity_check !== 'ok') {
            throw new DatabaseError('Database integrity check failed', {
                details: integrityCheck
            });
        }
    }

    async createBackupIfNeeded() {
        try {
            await this.backupManager.createBackup();
        } catch (error) {
            log.warn('Failed to create backup:', error);
        }
    }

    async createMigrationTable() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS migrations (
                filename TEXT PRIMARY KEY,
                hash TEXT NOT NULL,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Load existing migrations into memory
        const migrations = this.db.prepare('SELECT * FROM migrations').all();
        migrations.forEach(row => {
            this.migrationHistory.set(row.filename, {
                hash: row.hash,
                appliedAt: new Date(row.applied_at)
            });
        });
    }

    async getMigrationFiles() {
        const migrationPath = join(process.cwd(), 'db', 'migrations');
        const files = await readdir(migrationPath);
        return files
            .filter(file => file.endsWith('.sql'))
            .sort((a, b) => a.localeCompare(b))
            .map(file => join(migrationPath, file));
    }

    async runMigrations() {
        try {
            const migrationFiles = await this.getMigrationFiles();
            
            for (const file of migrationFiles) {
                await this.processSingleMigration(file);
            }
        } catch (error) {
            throw new Error('Failed to run migrations: ' + error.message);
        }
    }

    async processSingleMigration(filePath) {
        try {
            const migration = this.db.transaction(() => {
                const sql = readFileSync(filePath, 'utf8');
                sql.split(';').forEach(statement => {
                    if (statement.trim()) {
                        this.db.prepare(statement).run();
                    }
                });
            });

            migration();
            log.info(`Applied migration: ${filePath}`);
        } catch (error) {
            throw new DatabaseError(`Failed to apply migration ${filePath}`, { cause: error });
        }
    }

    startPeriodicBackups() {
        setInterval(async () => {
            try {
                await this.backupManager.createBackup();
            } catch (error) {
                this.logger.error('Failed to create periodic backup:', error);
            }
        }, 24 * 60 * 60 * 1000); // Daily backups
    }

    startPeriodicMaintenance() {
        setInterval(() => {
            try {
                this.db.prepare('PRAGMA optimize').run();
                this.db.prepare('PRAGMA wal_checkpoint(TRUNCATE)').run();
            } catch (error) {
                this.logger.error('Failed to run maintenance:', error);
            }
        }, 12 * 60 * 60 * 1000); // Every 12 hours
    }

    async handleInitializationError(error) {
        log.error('Handling initialization error:', error);
        // Add any cleanup or recovery logic here
    }

    // ... rest of the existing methods ...
}

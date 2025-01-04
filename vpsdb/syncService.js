import { Logger } from '../utils/logger.js';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

const log = new Logger('SyncService');

export class SyncService {
    constructor(dbConfig) {
        this.dbConfig = dbConfig;
        this.localPool = null;
        this.remotePool = null;
        this.syncInterval = null;
        this.retryAttempts = 0;
        this.maxRetries = 3;
        this.retryDelay = 5000; // 5 seconds
    }

    async createPool(config, isLocal = true) {
        const poolName = isLocal ? 'Local' : 'Remote';
        let attempts = 0;

        while (attempts < this.maxRetries) {
            try {
                const pool = await mysql.createPool({
                    ...config,
                    waitForConnections: true,
                    connectionLimit: isLocal ? 10 : 5,
                    queueLimit: 0
                });

                // Test connection
                await pool.query('SELECT 1');
                log.info(`${poolName} pool created successfully`);
                return pool;
            } catch (error) {
                attempts++;
                log.error(`Failed to create ${poolName} pool (attempt ${attempts}):`, error);
                
                if (attempts === this.maxRetries) {
                    throw new Error(`Failed to create ${poolName} database pool after ${this.maxRetries} attempts`);
                }
                
                await new Promise(resolve => setTimeout(resolve, this.retryDelay));
            }
        }
    }

    async runWithTransaction(pool, operations) {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const results = await Promise.all(operations.map(op => op(connection)));
            await connection.commit();
            return results;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async initialize() {
        try {
            this.localPool = await this.createPool(this.dbConfig.local, true);
            this.remotePool = await this.createPool(this.dbConfig.vps, false);

            // Verify sync tables exist
            await this.verifySyncTables(this.localPool);
            await this.verifySyncTables(this.remotePool);
            
            log.info('Sync tables verified on both databases');
            log.info('Sync service initialized');
        } catch (error) {
            log.error('Failed to initialize sync service:', error);
            throw error;
        }
    }

    async verifySyncTables(pool) {
        const requiredTables = ['sync_log', 'sync_status', 'sync_retry_log'];
        for (const table of requiredTables) {
            const [rows] = await pool.query(
                'SELECT 1 FROM information_schema.tables WHERE table_name = ?',
                [table]
            );
            if (rows.length === 0) {
                throw new Error(`Required table ${table} is missing`);
            }
        }
    }

    async startSync(intervalMs = 300000) { // 5 minutes default
        this.syncInterval = setInterval(async () => {
            try {
                await this.syncDatabases();
                log.info('Database sync completed successfully');
            } catch (error) {
                log.error('Database sync failed:', error);
            }
        }, intervalMs);
    }

    async syncDatabases() {
        const serverId = process.env.SERVER_ID;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                await this.updateSyncStatus(serverId, 'IN_PROGRESS');
                
                const localChanges = await this.getChanges(this.localPool);
                const remoteChanges = await this.getChanges(this.remotePool);
                
                await this.mergeChanges(localChanges, remoteChanges);
                await this.updateSyncStatus(serverId, 'SUCCESS');
                return;

            } catch (error) {
                retryCount++;
                await this.logSyncRetry(serverId, error.message);
                
                if (retryCount === maxRetries) {
                    await this.updateSyncStatus(serverId, 'FAILED', error.message);
                    throw error;
                }
                
                // Exponential backoff
                await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
            }
        }
    }

    async updateSyncStatus(serverId, status, errorMessage = null) {
        const sql = `
            INSERT INTO sync_status (server_id, status, error_message, retry_count)
            VALUES (?, ?, ?, 0)
            ON DUPLICATE KEY UPDATE 
                status = VALUES(status),
                error_message = VALUES(error_message),
                retry_count = retry_count + 1,
                last_sync = CURRENT_TIMESTAMP
        `;
        
        await this.localPool.query(sql, [serverId, status, errorMessage]);
        await this.remotePool.query(sql, [serverId, status, errorMessage]);
    }

    async logSyncRetry(serverId, errorMessage) {
        const sql = `
            INSERT INTO sync_retry_log (sync_id, error_message)
            SELECT id, ? FROM sync_status WHERE server_id = ?
        `;
        
        await this.localPool.query(sql, [errorMessage, serverId]);
        await this.remotePool.query(sql, [errorMessage, serverId]);
    }

    async getChanges(pool) {
        const [rows] = await pool.query('SELECT * FROM sync_log WHERE synced = 0');
        return rows;
    }

    async mergeChanges(localChanges, remoteChanges) {
        // Implement your merge logic here
        // This is just a basic example
        for (const change of localChanges) {
            await this.remotePool.query('INSERT INTO changes SET ?', change);
        }

        for (const change of remoteChanges) {
            await this.localPool.query('INSERT INTO changes SET ?', change);
        }
    }

    async stop() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        if (this.localPool) await this.localPool.end();
        if (this.remotePool) await this.remotePool.end();
    }
}

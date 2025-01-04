import { EventEmitter } from 'events';
import { Logger } from './logger.js';

const log = new Logger('Monitor');

class DatabaseMonitor extends EventEmitter {
    constructor(dbManager) {
        super();
        this.db = dbManager;
        this.stats = {
            queries: 0,
            errors: 0,
            lastBackup: null,
            activeConnections: 0
        };
    }

    startMonitoring() {
        // Monitor database performance
        setInterval(() => this.checkPerformance(), 60000);

        // Monitor database size
        setInterval(() => this.checkDatabaseSize(), 3600000);

        // Monitor backup status
        setInterval(() => this.checkBackupStatus(), 86400000);

        log.info('Database monitoring started');
    }

    async checkPerformance() {
        try {
            const metrics = await this.db.getPerformanceMetrics();
            this.emit('performance', metrics);

            if (metrics.queryTime > 1000) {
                log.warn('Slow query detected:', metrics);
            }
        } catch (error) {
            log.error('Performance check failed:', error);
        }
    }

    async checkDatabaseSize() {
        try {
            const size = await this.db.getDatabaseSize();
            this.emit('size', size);

            if (size > 1024 * 1024 * 1024) { // 1GB
                log.warn('Database size exceeds 1GB');
            }
        } catch (error) {
            log.error('Size check failed:', error);
        }
    }

    async checkBackupStatus() {
        try {
            const status = await this.db.getBackupStatus();
            this.emit('backup', status);

            if (!status.lastBackup) {
                log.warn('No recent backup found');
            }
        } catch (error) {
            log.error('Backup check failed:', error);
        }
    }
}

export { DatabaseMonitor };

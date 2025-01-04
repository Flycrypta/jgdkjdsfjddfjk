import { copyFile, unlink, readdir, mkdir } from 'fs/promises';
import { join } from 'path';
import { Logger } from '../../utils/logger.js';

const log = new Logger('BackupManager');

export class BackupManager {
    constructor(dbPath, options = {}) {
        this.dbPath = dbPath;
        this.backupDir = options.backupDir || join(process.cwd(), 'backups');
        this.maxBackups = options.maxBackups || 5;
        this.backupInterval = options.backupInterval || 24 * 60 * 60 * 1000; // 24 hours
        this.lastBackup = null;
    }

    async startScheduledBackups() {
        await this.createBackupDir();
        
        setInterval(async () => {
            try {
                await this.createBackup();
                log.info('Scheduled backup completed');
            } catch (error) {
                log.error('Scheduled backup failed:', error);
            }
        }, this.backupInterval);
    }

    async createBackupDir() {
        try {
            await mkdir(this.backupDir, { recursive: true });
        } catch (error) {
            log.error('Failed to create backup directory:', error);
        }
    }

    async createBackup() {
        try {
            const now = new Date();
            const backupName = `backup_${now.toISOString().replace(/[:.]/g, '-')}.db`;
            const backupPath = join(this.backupDir, backupName);

            await copyFile(this.dbPath, backupPath);
            this.lastBackup = now;
            log.info(`Created backup: ${backupName}`);

            await this.cleanupOldBackups();
        } catch (error) {
            log.error('Backup creation failed:', error);
            throw error;
        }
    }

    async cleanupOldBackups() {
        try {
            const files = await readdir(this.backupDir);
            const backups = files
                .filter(file => file.startsWith('backup_') && file.endsWith('.db'))
                .sort((a, b) => b.localeCompare(a));

            if (backups.length > this.maxBackups) {
                const toDelete = backups.slice(this.maxBackups);
                for (const file of toDelete) {
                    await unlink(join(this.backupDir, file));
                    log.info(`Deleted old backup: ${file}`);
                }
            }
        } catch (error) {
            log.error('Backup cleanup failed:', error);
            throw error;
        }
    }
}

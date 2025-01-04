import winston from 'winston';
import path from 'path';

export class LoggingService {
    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            ),
            defaultMeta: { service: 'discord-bot' },
            transports: [
                new winston.transports.File({
                    filename: 'logs/error.log',
                    level: 'error',
                    maxsize: 5242880, // 5MB
                    maxFiles: 5,
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.json()
                    )
                }),
                new winston.transports.File({
                    filename: 'logs/combined.log',
                    maxsize: 5242880,
                    maxFiles: 5
                })
            ]
        });

        if (process.env.NODE_ENV !== 'production') {
            this.logger.add(new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            }));
        }
    }

    async logError(errorContext) {
        const { type, logLevel = 'error' } = errorContext;

        this.logger.log(logLevel, {
            type,
            ...errorContext,
            timestamp: new Date().toISOString()
        });

        if (errorContext.type === 'DatabaseError') {
            await this._handleDatabaseError(errorContext);
        }
    }

    async _handleDatabaseError(errorContext) {
        // Additional database error handling logic
        await this._notifyAdmin(errorContext);
        await this._checkDatabaseHealth();
    }

    async _notifyAdmin(errorContext) {
        // Implementation for admin notification
    }

    async _checkDatabaseHealth() {
        // Implementation for database health check
    }
}

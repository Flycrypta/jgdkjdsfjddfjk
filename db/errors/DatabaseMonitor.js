import { EventEmitter } from 'events';
import { DatabaseErrorSeverity } from './DatabaseError.js';

export class DatabaseMonitor extends EventEmitter {
    constructor(logger) {
        super();
        this.logger = logger;
        this.errorCounts = new Map();
        this.lastErrors = new Map();
        this.startTime = Date.now();
    }

    trackError(error) {
        const errorType = error.code || 'UNKNOWN';
        this.errorCounts.set(errorType, (this.errorCounts.get(errorType) || 0) + 1);
        this.lastErrors.set(errorType, {
            timestamp: new Date(),
            error: error
        });

        if (error.context?.severity === 'FATAL') {
            this.emit('fatalError', error);
        }

        if (this.logger) {
            this.logger.error('Database Error:', {
                code: error.code,
                message: error.message,
                details: error.details,
                context: error.context
            });
        }
    }

    getErrorStats() {
        return {
            totalErrors: Array.from(this.errorCounts.values()).reduce((a, b) => a + b, 0),
            errorsByType: Object.fromEntries(this.errorCounts),
            uptime: Date.now() - this.startTime,
            lastErrors: Object.fromEntries(this.lastErrors)
        };
    }
}

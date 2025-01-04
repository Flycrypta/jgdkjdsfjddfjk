export const DatabaseErrorCodes = {
    TRANSACTION_FAILED: 'TRANSACTION_FAILED',
    INITIALIZATION_FAILED: 'INITIALIZATION_FAILED',
    QUERY_FAILED: 'QUERY_FAILED'
};

export class DatabaseError extends Error {
    constructor(code, details = {}) {
        super(`Database Error: ${code}`);
        this.code = code;
        this.details = details;
        this.name = 'DatabaseError';
    }
}

export class DatabaseMonitor {
    constructor(logger) {
        this.logger = logger || console;
    }

    trackError(error) {
        this.logger.error('Database Error:', {
            code: error.code,
            message: error.message,
            details: error.details
        });
    }
}

export const createError = (code, details = {}) => new DatabaseError(code, details);

export * from './DatabaseError.js';
export * from './ErrorCodes.js';

export const createError = (code, details) => {
    return new DatabaseError(`Database error: ${code}`, code, details);
};

export { DatabaseMonitor } from './DatabaseMonitor.js';

export const trackError = (logger, error) => {
    if (!logger) return;
    logger.error('Database Error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        context: error.context
    });
};

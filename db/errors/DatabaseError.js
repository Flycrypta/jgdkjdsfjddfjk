export const DatabaseErrorTypes = {
    TRANSACTION: {
        code: 'TRANSACTION_ERROR',
        emoji: '💢',
        message: 'Transaction failed'
    },
    VALIDATION: {
        code: 'VALIDATION_ERROR',
        emoji: '❌',
        message: 'Data validation failed'
    },
    CONNECTION: {
        code: 'CONNECTION_ERROR',
        emoji: '🔌',
        message: 'Database connection failed'
    },
    QUERY: {
        code: 'QUERY_ERROR',
        emoji: '❓',
        message: 'Query execution failed'
    },
    AUTH: {
        code: 'AUTH_ERROR',
        emoji: '🔒',
        message: 'Authentication failed'
    },
    CONSTRAINT: {
        code: 'CONSTRAINT_ERROR',
        emoji: '⛔',
        message: 'Constraint violation'
    },
    DUPLICATE: {
        code: 'DUPLICATE_ERROR',
        emoji: '📝',
        message: 'Duplicate entry'
    },
    FOREIGN_KEY: {
        code: 'FOREIGN_KEY_ERROR',
        emoji: '🔗',
        message: 'Foreign key constraint failed'
    },
    MIGRATION: {
        code: 'MIGRATION_ERROR',
        emoji: '🔄',
        message: 'Migration failed'
    },
    BACKUP: {
        code: 'BACKUP_ERROR',
        emoji: '💾',
        message: 'Backup operation failed'
    },
    PERMISSION: {
        code: 'PERMISSION_ERROR',
        emoji: '🚫',
        message: 'Insufficient permissions'
    },
    TRADE: {
        code: 'TRADE_ERROR',
        emoji: '🤝',
        message: 'Trade operation failed'
    }
};

export class DatabaseError extends Error {
    constructor(type, details = {}, cause = null) {
        const errorType = DatabaseErrorTypes[type];
        const message = `${errorType.emoji} ${errorType.message}: ${details.message || ''}`;
        
        super(message);
        this.name = 'DatabaseError';
        this.code = errorType.code;
        this.type = type;
        this.details = details;
        this.cause = cause;
        this.timestamp = new Date();
    }

    static handle(error, context = {}) {
        // Format the error for logging
        const formattedError = {
            type: error.type || 'UNKNOWN',
            code: error.code,
            message: error.message,
            details: error.details,
            timestamp: error.timestamp || new Date(),
            context: context,
            stack: error.stack
        };

        // Get user-friendly message
        const userMessage = this.getUserMessage(error);

        return {
            error: formattedError,
            userMessage: userMessage,
            logMessage: this.getLogMessage(formattedError)
        };
    }

    static getUserMessage(error) {
        const errorType = DatabaseErrorTypes[error.type];
        if (!errorType) return '❌ An unexpected error occurred';

        return `${errorType.emoji} ${error.details.userMessage || errorType.message}`;
    }

    static getLogMessage(formattedError) {
        return `[${formattedError.type}] ${formattedError.message}\n` +
               `Details: ${JSON.stringify(formattedError.details)}\n` +
               `Context: ${JSON.stringify(formattedError.context)}`;
    }

    static isOperational(error) {
        return error instanceof DatabaseError && 
               Object.keys(DatabaseErrorTypes).includes(error.type);
    }
}

// Example usage:
/*
try {
    // Database operation
} catch (error) {
    throw new DatabaseError('QUERY', {
        message: 'Failed to fetch user data',
        userMessage: 'Could not retrieve your information',
        query: 'SELECT * FROM users'
    }, error);
}

// Handling:
try {
    // Operation that might throw DatabaseError
} catch (error) {
    const handled = DatabaseError.handle(error, {
        userId: 'user123',
        operation: 'fetchUserData'
    });
    console.error(handled.logMessage);
    await interaction.reply(handled.userMessage);
}
*/

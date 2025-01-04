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
    },
    DEPLOYMENT: {
        code: 'DEPLOYMENT_ERROR',
        emoji: '🚀',
        message: 'Deployment failed'
    },
    ROLLBACK: {
        code: 'ROLLBACK_ERROR',
        emoji: '↩️',
        message: 'Rollback failed'
    }
};

export const DatabaseErrorCodes = {
    CONNECTION_ERROR: 'DB_CONNECTION_ERROR',
    INITIALIZATION_FAILED: 'DB_INIT_FAILED',
    QUERY_FAILED: 'DB_QUERY_FAILED',
    TABLE_NOT_FOUND: 'DB_TABLE_NOT_FOUND',
    INVALID_SCHEMA: 'DB_INVALID_SCHEMA',
    TRANSACTION_FAILED: 'DB_TRANSACTION_FAILED',
    DATA_INTEGRITY: 'DB_DATA_INTEGRITY'
};

export class DatabaseError extends Error {
    constructor(message, code, context = {}) {
        super(message);
        this.name = 'DatabaseError';
        this.code = code;
        this.context = context;
        this.timestamp = new Date();
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

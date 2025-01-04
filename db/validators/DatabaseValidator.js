import { DatabaseValidationError, DatabaseErrorFactory } from '../errors/DatabaseError.js';

export class DatabaseValidator {
    static validateQueryParams(params, schema) {
        const errors = [];
        
        for (const [key, value] of Object.entries(params)) {
            const schemaType = schema[key];
            if (!schemaType) {
                errors.push(`Unknown parameter: ${key}`);
                continue;
            }

            if (!this.validateType(value, schemaType)) {
                errors.push(`Invalid type for ${key}: expected ${schemaType}, got ${typeof value}`);
            }
        }

        if (errors.length > 0) {
            throw new DatabaseValidationError(
                'Query parameter validation failed',
                errors,
                { params, schema }
            );
        }
    }

    static validateType(value, expectedType) {
        switch (expectedType) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number' && !isNaN(value);
            case 'boolean':
                return typeof value === 'boolean';
            case 'array':
                return Array.isArray(value);
            case 'object':
                return value !== null && typeof value === 'object' && !Array.isArray(value);
            default:
                return false;
        }
    }

    static validateTableOperation(db, tableName, operation) {
        const tableExists = db.prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
        ).get(tableName);

        if (!tableExists && operation !== 'create') {
            throw DatabaseErrorFactory.createTableError(tableName, operation);
        }
    }
}

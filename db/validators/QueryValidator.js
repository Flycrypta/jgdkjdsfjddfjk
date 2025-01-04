import { DatabaseErrorFactory } from '../errors/DatabaseError.js';

export class QueryValidator {
    static validateQuery(query, params = {}) {
        // Check for basic SQL injection patterns
        const sqlInjectionPatterns = [
            /(\s|;|\/\*|\*\/|'|"|`|--)+(OR|AND|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|ALTER)\s/i,
            /;\s*DROP\s+TABLE/i,
            /;\s*DELETE\s+FROM/i
        ];

        for (const pattern of sqlInjectionPatterns) {
            if (pattern.test(query)) {
                throw DatabaseErrorFactory.createQueryError(query, null, {
                    reason: 'Potential SQL injection detected'
                });
            }
        }

        // Validate parameter types
        this.validateParams(params);
        
        return true;
    }

    static validateParams(params) {
        for (const [key, value] of Object.entries(params)) {
            if (value === undefined || value === null) {
                throw DatabaseErrorFactory.createDataError(value, 'non-null', {
                    parameter: key
                });
            }

            // Check for unsafe types
            if (typeof value === 'function' || value instanceof Promise) {
                throw DatabaseErrorFactory.createDataError(value, 'primitive', {
                    parameter: key
                });
            }
        }
    }
}

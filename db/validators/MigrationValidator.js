import { DatabaseError } from '../errors/DatabaseError.js';

const FORBIDDEN_STATEMENTS = [
    'DROP DATABASE',
    'TRUNCATE DATABASE',
    'DELETE FROM users',
    // Add other dangerous operations
];

const REQUIRED_PATTERNS = {
    createTable: /CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS/i,
    primaryKey: /PRIMARY\s+KEY/i
};

export function validateMigration(content) {
    // Check for forbidden statements
    for (const forbidden of FORBIDDEN_STATEMENTS) {
        if (content.toUpperCase().includes(forbidden)) {
            throw new DatabaseError('Migration contains forbidden statement', {
                statement: forbidden
            });
        }
    }

    // Validate syntax patterns
    const statements = content.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
        validateStatement(statement);
    }

    return true;
}

function validateStatement(statement) {
    // Add your validation logic here
    // This is just an example
    if (statement.toLowerCase().includes('create table')) {
        if (!REQUIRED_PATTERNS.createTable.test(statement)) {
            throw new DatabaseError('Create table must use IF NOT EXISTS');
        }
        if (!REQUIRED_PATTERNS.primaryKey.test(statement)) {
            throw new DatabaseError('Tables must have a primary key');
        }
    }
}

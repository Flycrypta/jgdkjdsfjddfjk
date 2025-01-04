import { DatabaseError, DatabaseErrorCodes } from '../errors/DatabaseError.js';

export class SchemaValidator {
    static validateColumn(tableName, columnName, value, expectedType) {
        if (value === null || value === undefined) {
            throw new DatabaseError(
                `Column '${columnName}' in table '${tableName}' cannot be null`,
                DatabaseErrorCodes.DATA_TYPE_MISMATCH,
                { tableName, columnName, value, expectedType }
            );
        }

        switch (expectedType) {
            case 'INTEGER':
                if (!Number.isInteger(value)) {
                    throw new DatabaseError(
                        `Value for column '${columnName}' must be an integer`,
                        DatabaseErrorCodes.DATA_TYPE_MISMATCH,
                        { tableName, columnName, value, expectedType }
                    );
                }
                break;
            case 'TEXT':
                if (typeof value !== 'string') {
                    throw new DatabaseError(
                        `Value for column '${columnName}' must be text`,
                        DatabaseErrorCodes.DATA_TYPE_MISMATCH,
                        { tableName, columnName, value, expectedType }
                    );
                }
                break;
            // Add more type validations as needed
        }
    }

    static validateTableSchema(db, tableName, requiredColumns) {
        const tableInfo = db.prepare(`PRAGMA table_info(${tableName})`).all();
        const columnNames = tableInfo.map(col => col.name);

        for (const col of requiredColumns) {
            if (!columnNames.includes(col)) {
                throw new DatabaseError(
                    `Required column '${col}' missing from table '${tableName}'`,
                    DatabaseErrorCodes.COLUMN_NOT_FOUND,
                    { tableName, missingColumn: col, existingColumns: columnNames }
                );
            }
        }
    }
}

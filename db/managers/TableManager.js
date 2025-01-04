import { SchemaValidator } from '../validators/SchemaValidator.js';
import { DatabaseError, DatabaseErrorCodes } from '../errors/DatabaseError.js';

export class TableManager {
    constructor(db) {
        this.db = db;
        this.columnTypesCache = {};
    }

    verifyTable(tableName, requiredColumns) {
        try {
            const tableExists = this.db.prepare(
                "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
            ).get(tableName);

            if (!tableExists) {
                throw new DatabaseError(
                    `Table '${tableName}' does not exist`,
                    DatabaseErrorCodes.TABLE_NOT_FOUND,
                    { tableName }
                );
            }

            SchemaValidator.validateTableSchema(this.db, tableName, requiredColumns);

            if (!this.compareSchema(tableName, requiredColumns)) {
                console.warn(`Potential schema drift detected for table: ${tableName}`);
                this.columnTypesCache[tableName] = null; // Invalidate cache
            }

            return true;
        } catch (error) {
            if (error instanceof DatabaseError) {
                throw error;
            }
            throw new DatabaseError(
                `Failed to verify table '${tableName}'`,
                DatabaseErrorCodes.INVALID_SCHEMA,
                { tableName, error: error.message }
            );
        }
    }

    compareSchema(tableName, requiredColumns) {
        // Example of comparing cached column types with requiredColumns
        // ...existing code...
        return true;
    }

    getColumnTypes(tableName) {
        if (this.columnTypesCache[tableName]) {
            return this.columnTypesCache[tableName];
        }

        const columnTypes = this.db.prepare(`PRAGMA table_info(${tableName})`).all()
            .reduce((acc, col) => {
                acc[col.name] = col.type;
                return acc;
            }, {});

        this.columnTypesCache[tableName] = columnTypes;
        return columnTypes;
    }

    validateRow(tableName, data) {
        const columnTypes = this.getColumnTypes(tableName);
        
        for (const [column, value] of Object.entries(data)) {
            if (columnTypes[column]) {
                SchemaValidator.validateColumn(tableName, column, value, columnTypes[column]);
            }
        }
    }
}

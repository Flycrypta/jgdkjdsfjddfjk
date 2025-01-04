import { Database } from '../db/Database.js';
import { DatabaseError } from '../db/errors/DatabaseError.js';
import { config } from '../config/index.js';

export const db = new Database(config.database);
export const database = db; // For backward compatibility

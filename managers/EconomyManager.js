import { DatabaseError } from '../db/errors/DatabaseError.js';

export class EconomyManager {
    constructor(db) {
        this.db = db;
    }

    async getBalance(userId) {
        try {
            const result = await this.db.query('SELECT balance FROM users WHERE id = $1', [userId]);
            return result.rows[0].balance;
        } catch (error) {
            throw new DatabaseError('Failed to get balance', error);
        }
    }

    async updateBalance(userId, amount) {
        try {
            await this.db.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, userId]);
        } catch (error) {
            throw new DatabaseError('Failed to update balance', error);
        }
    }
}

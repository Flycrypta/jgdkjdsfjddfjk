import { createError, ErrorCodes, trackError } from '../errors/index.js';

export class TransactionManager {
    constructor(db, logger) {
        this.db = db;
        this.logger = logger;
        this.monitor = new DatabaseMonitor(logger);
        this.activeTransactions = new Map();
        this.transactionQueue = [];
        this.isProcessing = false;
    }

    async executeTransaction(operations, options = {}) {
        const transactionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        try {
            const transaction = this.db.transaction(() => {
                return operations.reduce((results, operation) => {
                    try {
                        const result = operation();
                        results.push(result);
                        return results;
                    } catch (error) {
                        throw createError(
                            ErrorCodes.TRANSACTION_FAILED,
                            { 
                                operation: operation.name,
                                transactionId,
                                error: error.message 
                            }
                        );
                    }
                }, []);
            });

            this.activeTransactions.set(transactionId, {
                startTime: Date.now(),
                operations: operations.length
            });

            const results = transaction();
            
            this.activeTransactions.delete(transactionId);
            return results;

        } catch (error) {
            trackError(this.logger, error);
            
            if (options.retryOnFail && !this.isProcessing) {
                return this.retryTransaction(operations, options);
            }
            
            throw error;
        }
    }

    async retryTransaction(operations, options, attempt = 1) {
        if (attempt > options.maxRetries || attempt > 3) {
            throw createError(
                ErrorCodes.TRANSACTION_FAILED,
                { attempts: attempt, reason: 'Max retries exceeded' }
            );
        }

        await new Promise(resolve => setTimeout(resolve, attempt * 1000));
        return this.executeTransaction(operations, {
            ...options,
            attempt: attempt + 1
        });
    }

    queueTransaction(operations, options = {}) {
        return new Promise((resolve, reject) => {
            this.transactionQueue.push({
                operations,
                options,
                resolve,
                reject
            });

            if (!this.isProcessing) {
                this.processQueue();
            }
        });
    }

    async processQueue() {
        if (this.transactionQueue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const { operations, options, resolve, reject } = this.transactionQueue.shift();

        try {
            const results = await this.executeTransaction(operations, options);
            resolve(results);
        } catch (error) {
            reject(error);
        } finally {
            this.processQueue();
        }
    }

    getActiveTransactions() {
        return Array.from(this.activeTransactions.entries()).map(([id, info]) => ({
            id,
            duration: Date.now() - info.startTime,
            operations: info.operations
        }));
    }

    rollback(transactionId) {
        if (!this.activeTransactions.has(transactionId)) {
            throw createError(
                ErrorCodes.TRANSACTION_FAILED,
                { transactionId, reason: 'Transaction not found' }
            );
        }

        this.db.exec('ROLLBACK');
        this.activeTransactions.delete(transactionId);
    }

    async cleanup() {
        // Rollback any pending transactions
        for (const [transactionId] of this.activeTransactions) {
            try {
                this.rollback(transactionId);
            } catch (error) {
                trackError(this.logger, error);
            }
        }

        this.activeTransactions.clear();
        this.transactionQueue = [];
        this.isProcessing = false;
    }
}

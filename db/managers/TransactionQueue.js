export class TransactionQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
    }

    add(transaction) {
        this.queue.push(transaction);
        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }

        this.isProcessing = true;
        const transaction = this.queue.shift();

        try {
            await transaction();
        } catch (error) {
            console.error('Transaction failed:', error);
        } finally {
            this.processQueue();
        }
    }
}

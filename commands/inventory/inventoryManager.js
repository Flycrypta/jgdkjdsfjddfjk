import { items } from '../../config/gameData.js';

export class InventoryManager {
    static checkJobRequirements(userId, item, userJobs) {
        if (item.jobRequired && !userJobs.includes(item.jobRequired)) {
            return false;
        }
        return true;
    }

    static async addItem(dbManager, userId, itemId, quantity = 1) {
        const item = items.find(i => i.id === itemId);
        if (!item) throw new Error('Item not found');

        // Check job requirements if applicable
        if (item.jobRequired) {
            const userJobs = await dbManager.getUserJobs(userId);
            if (!this.checkJobRequirements(userId, item, userJobs)) {
                throw new Error('Job requirement not met');
            }
        }

        return await dbManager.addToInventory(userId, itemId, quantity);
    }

    static async getInventoryWithDetails(dbManager, userId) {
        const inventory = await dbManager.getInventory(userId);
        return inventory.map(item => ({
            ...item,
            ...items.find(i => i.id === item.item_id)
        }));
    }
}

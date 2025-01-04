import { dbManager } from '../db/database.js';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class StatsManager {
    constructor() {
        this.db = dbManager.db;
        this.dataPath = join(__dirname, '..', 'data');
    }

    async updateItemStats(itemId) {
        const stats = this.db.prepare(`
            SELECT 
                COUNT(DISTINCT user_id) as current_owners,
                (SELECT COUNT(*) FROM item_history WHERE item_id = ? AND action_type = 'OBTAINED') as total_obtained,
                (SELECT COUNT(*) FROM wheel_spins WHERE reward_item_id = ?) as times_appeared
            FROM inventory 
            WHERE item_id = ?
        `).get(itemId, itemId, itemId);

        const totalSpins = this.db.prepare('SELECT COUNT(*) as count FROM wheel_spins').get().count;
        const rarityPercentage = (stats.times_appeared / totalSpins) * 100;

        this.db.prepare(`
            INSERT INTO item_statistics (
                item_id, total_obtained, current_owners, 
                last_obtained_at, rarity_percentage, times_appeared
            ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?)
            ON CONFLICT(item_id) DO UPDATE SET
                total_obtained = excluded.total_obtained,
                current_owners = excluded.current_owners,
                last_obtained_at = excluded.last_obtained_at,
                rarity_percentage = excluded.rarity_percentage,
                times_appeared = excluded.times_appeared
        `).run(itemId, stats.total_obtained, stats.current_owners, rarityPercentage, stats.times_appeared);
    }

    async getItemStats(itemId) {
        return this.db.prepare(`
            SELECT 
                i.name,
                i.rarity,
                s.total_obtained,
                s.current_owners,
                s.rarity_percentage,
                s.times_appeared,
                s.last_obtained_at
            FROM items i
            LEFT JOIN item_statistics s ON i.id = s.item_id
            WHERE i.id = ?
        `).get(itemId);
    }

    async getRarityRankings() {
        return this.db.prepare(`
            SELECT 
                i.name,
                i.rarity,
                s.rarity_percentage,
                s.total_obtained,
                s.current_owners
            FROM items i
            JOIN item_statistics s ON i.id = s.item_id
            ORDER BY s.rarity_percentage ASC
        `).all();
    }

    async recordItemObtained(userId, itemId, source) {
        this.db.transaction(() => {
            // Record in history
            this.db.prepare(`
                INSERT INTO item_history (item_id, user_id, action_type, source)
                VALUES (?, ?, 'OBTAINED', ?)
            `).run(itemId, userId, source);

            // Update statistics
            this.updateItemStats(itemId);
        })();
    }

    async getWheelStats(wheelId) {
        return this.db.prepare(`
            SELECT 
                w.*,
                (SELECT item_id 
                 FROM wheel_spins 
                 WHERE wheel_id = ? 
                 GROUP BY reward_item_id 
                 ORDER BY COUNT(*) DESC 
                 LIMIT 1) as most_common_prize
            FROM wheel_statistics w
            WHERE w.wheel_id = ?
        `).get(wheelId, wheelId);
    }
}

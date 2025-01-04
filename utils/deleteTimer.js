import { dbManager } from '../db/database.js';

export async function initializeTimers(db, client, guildId) {
    try {
        const results = await dbManager.db.prepare('SELECT channel_id, closed_at FROM closed_tickets').all();
        const now = Date.now();

        for (const { channel_id, closed_at } of results) {
            const closedTime = new Date(closed_at).getTime();
            const elapsed = now - closedTime;
            const remaining = 24 * 60 * 60 * 1000 - elapsed;

            if (remaining > 0) {
                scheduleDeletion(client, channel_id, remaining, guildId);
            } else {
                await handleExpiredTimer(client, channel_id, guildId, db);
            }
        }
    } catch (error) {
        console.error('Error initializing timers:', error);
    }
}

export function scheduleDeletion(client, channelId, timeout, guildId) {
    setTimeout(async () => {
        try {
            const guild = await client.guilds.fetch(guildId);
            const channel = guild.channels.cache.get(channelId);
            if (channel?.deletable) {
                await channel.delete();
                await dbManager.db.prepare('DELETE FROM closed_tickets WHERE channel_id = ?').run(channelId);
                console.log(`Deleted channel ${channelId}`);
            }
        } catch (error) {
            console.error('Error deleting channel:', error);
        }
    }, timeout);
}

async function handleExpiredTimer(client, channelId, guildId, db) {
    try {
        const guild = await client.guilds.fetch(guildId);
        const channel = guild.channels.cache.get(channelId);
        if (channel?.deletable) {
            await channel.delete('Automatically deleted on bot restart');
            await db.prepare('DELETE FROM closed_tickets WHERE channel_id = ?').run(channelId);
            console.log(`Cleaned up expired channel ${channelId}`);
        }
    } catch (error) {
        console.error(`Error handling expired timer for channel ${channelId}:`, error);
    }
}
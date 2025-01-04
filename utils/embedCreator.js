import { EmbedBuilder } from 'discord.js';
import config from '../config/config.js';

export class EmbedCreator {
    static error(message) {
        return new EmbedBuilder()
            .setColor(config.colors.error)
            .setDescription(`❌ ${message}`);
    }

    static success(message) {
        return new EmbedBuilder()
            .setColor(config.colors.success)
            .setDescription(`✅ ${message}`);
    }

    static info(title, description) {
        return new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(title)
            .setDescription(description);
    }

    static inventory(user, items) {
        return new EmbedBuilder()
            .setColor(config.colors.primary)
            .setTitle(`${user.username}'s Inventory`)
            .setDescription(
                items.length ? items.map(i => `${i.name} x${i.quantity}`).join('\n')
                : 'No items found'
            );
    }
}

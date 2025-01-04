import { EmbedBuilder } from 'discord.js';
import { dbManager } from '../db/database.js';

export default {
    name: 'stats',
    description: 'View your game statistics',
    async execute(interaction) {
        const userId = interaction.user.id;
        
        try {
            const stats = await dbManager.getUserStats(userId);
            const embed = new EmbedBuilder()
                .setTitle('Your Stats')
                .setDescription(`Stats for ${interaction.user.username}`)
                .addFields(
                    { name: 'Total Spins', value: stats.total_spins.toString(), inline: true },
                    { name: 'Total Rewards', value: stats.total_rewards.toString(), inline: true },
                    { name: 'Highest Reward', value: stats.highest_reward.toString(), inline: true }
                );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await interaction.reply('Error fetching stats: ' + error.message);
        }
    }
};

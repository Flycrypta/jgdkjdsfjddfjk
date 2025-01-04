import { SlashCommandBuilder } from '@discordjs/builders';
import BaseCommand from '../base-command.js';

export default class DailyCommand extends BaseCommand {
    constructor() {
        super();
        this.data = new SlashCommandBuilder()
            .setName('daily')
            .setDescription('Claim your daily reward');
        this.category = 'Economy';
        this.cooldown = 86400; // 24 hours
    }

    async execute(interaction) {
        try {
            const userId = interaction.user.id;
            
            // Verify cooldown through database
            const canClaim = await interaction.client.dbManager.canClaimDaily(userId);
            if (!canClaim) {
                const nextClaim = await interaction.client.dbManager.getNextClaimTime(userId);
                return interaction.reply({
                    content: `⏰ You can claim your next reward ${nextClaim}`,
                    ephemeral: true
                });
            }

            // Process reward
            const reward = await interaction.client.dbManager.claimDailyReward(userId);
            
            // Reply with results
            await interaction.reply({
                content: `🎉 Daily Reward Claimed!\n` +
                         `💰 Amount: ${reward.amount.toLocaleString()} coins\n` +
                         `🔥 Streak: ${reward.streak} days\n` +
                         `✨ Multiplier: ${reward.multiplier}x`,
                ephemeral: true
            });
        } catch (error) {
            await this.handleError(interaction, error);
        }
    }
}

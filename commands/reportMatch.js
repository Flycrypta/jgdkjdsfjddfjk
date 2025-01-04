import { SlashCommandBuilder } from '@discordjs/builders';
import { dbManager } from '../db/database.js';

export const reportMatchCommand = {
    data: new SlashCommandBuilder()
        .setName('report-match')
        .setDescription('Report the result of a 1v1 match')
        .addStringOption(option =>
            option.setName('match-id')
                .setDescription('The ID of the match')
                .setRequired(true))
        .addUserOption(option =>
            option.setName('winner')
                .setDescription('The user who won the match')
                .setRequired(true)),

    async execute(interaction) {
        const matchId = interaction.options.getString('match-id');
        const winner = interaction.options.getUser('winner');
        const userId = interaction.user.id;

        try {
            await dbManager.reportMatchResult(matchId, winner.id);
            await interaction.reply(`Match result reported. Winner: ${winner.username}`);
        } catch (error) {
            console.error('Error reporting match result:', error);
            await interaction.reply({
                content: 'An error occurred while reporting the match result.',
                ephemeral: true
            });
        }
    }
};

export default reportMatchCommand;

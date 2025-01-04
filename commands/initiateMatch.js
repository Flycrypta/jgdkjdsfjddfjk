import { SlashCommandBuilder } from '@discordjs/builders';
import { dbManager } from '../db/database.js';

export const initiateMatchCommand = {
    data: new SlashCommandBuilder()
        .setName('initiate-match')
        .setDescription('Initiate a 1v1 match with another player')
        .addUserOption(option =>
            option.setName('opponent')
                .setDescription('The user you want to 1v1')
                .setRequired(true)),

    async execute(interaction) {
        const opponent = interaction.options.getUser('opponent');
        const userId = interaction.user.id;
        const opponentId = opponent.id;

        try {
            const matchId = await dbManager.createMatch(userId, opponentId);
            await interaction.reply(`Match initiated with ${opponent.username}. Match ID: ${matchId}`);
        } catch (error) {
            console.error('Error initiating match:', error);
            await interaction.reply({
                content: 'An error occurred while initiating the match.',
                ephemeral: true
            });
        }
    }
};

export default initiateMatchCommand;

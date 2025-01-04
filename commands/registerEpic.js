import { SlashCommandBuilder } from '@discordjs/builders';
import { dbManager } from '../db/database.js';

export const registerEpicCommand = {
    data: new SlashCommandBuilder()
        .setName('register-epic')
        .setDescription('Register your Epic Games username for Fortnite matchmaking')
        .addStringOption(option =>
            option.setName('username')
                .setDescription('Your Epic Games username')
                .setRequired(true)),

    async execute(interaction) {
        const username = interaction.options.getString('username');
        const userId = interaction.user.id;

        try {
            await dbManager.registerEpicUsername(userId, username);
            await interaction.reply(`Successfully registered Epic Games username: ${username}`);
        } catch (error) {
            console.error('Error registering Epic username:', error);
            await interaction.reply({
                content: 'An error occurred while registering your Epic Games username.',
                ephemeral: true
            });
        }
    }
};

export default registerEpicCommand;

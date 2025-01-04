import { SlashCommandBuilder } from 'discord.js';
// Ensure the correct import path for DatabaseError
// import { DatabaseError } from '../db/errors/DatabaseError.js';
import { dbManager } from '../db/database.js';
import { PermissionsBitField } from 'discord.js';
import { db } from './database.js';

const OWNER_ID = process.env.OWNER_ID; // Add this to your .env file

export default {
    name: 'godmode',
    description: 'Toggle godmode for testing (Owner only)',
    permissions: [PermissionsBitField.Flags.Administrator],
    async execute(interaction) {
        if (interaction.user.id !== OWNER_ID) {
            return await interaction.reply('This command is only for the bot owner!');
        }

        try {
            const result = await dbManager.toggleGodMode(interaction.user.id);
            await interaction.reply(`Godmode has been ${result.enabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            await interaction.reply('Failed to toggle godmode: ' + error.message);
        }
    }
};

import { SlashCommandBuilder } from '@discordjs/builders';
import { dbManager } from '../db/database.js';
import path from 'path';

export const data = new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Shows statistics');

export async function execute(interaction) {
    try {
        const stats = await dbManager.getStats();
        await interaction.reply(`Bot statistics: ${JSON.stringify(stats)}`);
    } catch (error) {
        console.error('Error executing stats command:', error);
        await interaction.reply('Failed to retrieve statistics.');
    }
}

export default { data, execute };

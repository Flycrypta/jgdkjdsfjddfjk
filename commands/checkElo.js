import { SlashCommandBuilder } from 'discord.js';
import { dbManager } from '../db/database.js';
import { DatabaseError } from '../db/errors/DatabaseError.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const data = new SlashCommandBuilder()
    .setName('check-elo')
    .setDescription('Check your ELO and rank');

export async function execute(interaction) {
    const userId = interaction.user.id;

    try {
        const elo = await dbManager.getElo(userId);
        await interaction.reply(`Your ELO: ${elo}`);
    } catch (error) {
        console.error('Error checking ELO:', error);
        await interaction.reply({
            content: 'An error occurred while checking your ELO.',
            ephemeral: true
        });
    }
}

export default { data, execute };

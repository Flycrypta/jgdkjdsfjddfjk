import { SlashCommandBuilder } from '@discordjs/builders';
import { exec } from 'child_process';
import { Logger } from '../utils/logger.js';

export const data = new SlashCommandBuilder()
    .setName('restart')
    .setDescription('Restarts the bot');

export async function execute(interaction) {
    const logger = new Logger(interaction.client);
    await interaction.reply('Restarting the bot...');
    await logger.info('Bot is restarting...');

    exec('pm2 restart discord-bot', async (error, stdout, stderr) => {
        if (error) {
            console.error(`Error during restart: ${error.message}`);
            await logger.error(`Failed to restart the bot: ${error.message}`);
            return interaction.followUp('Failed to restart the bot.');
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
        }
        console.log(`Stdout: ${stdout}`);
        await logger.info('Bot restarted successfully.');
        interaction.followUp('Bot restarted successfully.');
    });
}

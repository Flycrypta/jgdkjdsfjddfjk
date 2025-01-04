import { SlashCommandBuilder } from '@discordjs/builders';
import { exec } from 'child_process';
import { Logger } from '../utils/logger.js';

export const data = new SlashCommandBuilder()
    .setName('recode')
    .setDescription('Recodes the bot using GitHub Copilot and restarts it');

export async function execute(interaction) {
    const logger = new Logger(interaction.client);
    await interaction.reply('Recoding the bot using GitHub Copilot...');
    await logger.info('Bot is being recoded using GitHub Copilot...');

    exec('npx github-copilot-cli recode', async (error, stdout, stderr) => {
        if (error) {
            console.error(`Error during recoding: ${error.message}`);
            await logger.error(`Failed to recode the bot: ${error.message}`);
            return interaction.followUp('Failed to recode the bot.');
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
        }
        console.log(`Stdout: ${stdout}`);

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
            await logger.info('Bot recoded and restarted successfully.');
            interaction.followUp('Bot recoded and restarted successfully.');
        });
    });
}

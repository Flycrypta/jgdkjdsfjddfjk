import { SlashCommandBuilder } from '@discordjs/builders';
import { dbManager } from '../db/database.js';
import { DatabaseError } from '../db/errors/DatabaseError.js';

const COOLDOWN_TIME = 5 * 60 * 1000; // 5 minutes in milliseconds

export const data = new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work to earn coins')
    .addSubcommand(subcommand =>
        subcommand
            .setName('do')
            .setDescription('Perform a job')
            .addIntegerOption(option =>
                option
                    .setName('job_id')
                    .setDescription('ID of the job')
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('list')
            .setDescription('List available jobs'));

export async function execute(interaction) {
    const subCommand = interaction.options.getSubcommand();
    if (subCommand === 'do') {
        try {
            const userId = interaction.user.id;
            const lastWorkTime = await dbManager.getLastWorkTime(userId);
            const currentTime = Date.now();
            
            if (lastWorkTime && currentTime - lastWorkTime < COOLDOWN_TIME) {
                const remainingTime = Math.ceil((COOLDOWN_TIME - (currentTime - lastWorkTime)) / 1000);
                return await interaction.reply(`You must wait ${remainingTime} seconds before working again!`);
            }

            const jobId = interaction.options.getInteger('job_id');
            const { payout, xp, jobName } = await dbManager.workJob(userId, jobId);
            await dbManager.updateLastWorkTime(userId, currentTime);
            
            await interaction.reply(`You worked as a ${jobName} and earned ${payout} coins (+${xp} XP).\nYou can work again in 5 minutes.`);
        } catch (error) {
            if (error instanceof DatabaseError) {
                await interaction.reply(`Database error: ${error.message}`);
            } else {
                if (!error.message) {
                    await interaction.reply('Could not load job from the database.');
                } else {
                    await interaction.reply(`An unexpected error occurred: ${error.message}`);
                }
            }
        }
    } else if (subCommand === 'list') {
        try {
            const jobs = await dbManager.listJobs(); // hypothetical method
            await interaction.reply(`Available jobs: ${jobs.join(', ')}`);
        } catch (error) {
            await interaction.reply('Failed to load jobs from the database.');
        }
    }
}

export default { data, execute };

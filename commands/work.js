import { SlashCommandBuilder } from '@discordjs/builders';
import { dbManager } from '../db/database.js';

export const data = new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work to earn coins');

export async function execute(interaction) {
    const jobId = interaction.options.getInteger('job_id');
    const userId = interaction.user.id;

    try {
        const { payout, xp, jobName } = dbManager.workJob(userId, jobId);
        await interaction.reply(`You worked as a ${jobName} and earned ${payout} coins (+${xp} XP).`);
    } catch (error) {
        await interaction.reply(`Failed to work: ${error.message}`);
    }
}

export default { data, execute };
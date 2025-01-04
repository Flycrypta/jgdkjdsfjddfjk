import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { dbManager } from '../../db/database.js';

export const data = new SlashCommandBuilder()
    .setName('jobstatus')
    .setDescription('Check your job status and progress');

export async function execute(interaction) {
    try {
        const jobData = await dbManager.getUserJobs(interaction.user.id);
        
        const embed = new EmbedBuilder()
            .setTitle('🏢 Job Status')
            .setColor('#0099ff')
            .setTimestamp();

        if (!jobData || jobData.length === 0) {
            embed.setDescription('You are currently unemployed. Use /apply to get a job!');
        } else {
            jobData.forEach(job => {
                embed.addFields(
                    { name: job.title, value: `Level: ${job.level}\nExperience: ${job.exp}\nTotal Earnings: ${job.totalEarnings}` }
                );
            });
        }

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        await interaction.reply('Failed to get job status');
    }
}

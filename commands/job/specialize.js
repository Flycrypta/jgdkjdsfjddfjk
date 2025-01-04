import { SlashCommandBuilder } from 'discord.js';
import { jobSpecializations } from '../../config/jobConfig.js';
import { dbManager } from '../../db/database.js';

export const data = new SlashCommandBuilder()
    .setName('specialize')
    .setDescription('Choose a job specialization')
    .addStringOption(option =>
        option.setName('path')
            .setDescription('Specialization path')
            .setRequired(true)
            .addChoices(
                { name: 'Diagnostics', value: 'diagnostics' },
                { name: 'Restoration', value: 'restoration' },
                { name: 'Sales', value: 'sales' }
            ));

export async function execute(interaction) {
    const path = interaction.options.getString('path');
    const userId = interaction.user.id;

    try {
        const currentJob = await dbManager.getUserPrimaryJob(userId);
        if (!jobSpecializations[currentJob]?.[path]) {
            return interaction.reply('This specialization is not available for your job!');
        }

        const result = await dbManager.setJobSpecialization(userId, currentJob, path);
        await interaction.reply(
            `You are now specializing in ${path}! This will grant you new bonuses as you level up.`
        );
    } catch (error) {
        await interaction.reply(`Failed to specialize: ${error.message}`);
    }
}

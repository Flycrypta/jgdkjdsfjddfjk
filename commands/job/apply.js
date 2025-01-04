import { SlashCommandBuilder } from 'discord.js';
import { jobs } from '../../config/gameData.js';
import { dbManager } from '../../db/database.js';

export const data = new SlashCommandBuilder()
    .setName('apply')
    .setDescription('Apply for a job')
    .addStringOption(option =>
        option.setName('job')
            .setDescription('The job to apply for')
            .setRequired(true)
            .addChoices(
                { name: 'Mechanic', value: jobs.MECHANIC },
                { name: 'Chef', value: jobs.CHEF },
                { name: 'Security', value: jobs.SECURITY },
                { name: 'Office Worker', value: jobs.OFFICE_WORKER },
                { name: 'Real Estate', value: jobs.REAL_ESTATE },
                { name: 'Driver', value: jobs.DRIVER },
                { name: 'Factory Worker', value: jobs.FACTORY_WORKER },
                { name: 'Car Dealer', value: jobs.DEALER }
            ));

export async function execute(interaction) {
    const jobType = interaction.options.getString('job');

    try {
        const result = await dbManager.applyForJob(interaction.user.id, jobType);
        if (result.success) {
            await interaction.reply(`Congratulations! You've been hired as a ${jobType}!`);
        } else {
            await interaction.reply(result.message || 'Failed to apply for job');
        }
    } catch (error) {
        await interaction.reply(`Failed to apply: ${error.message}`);
    }
}

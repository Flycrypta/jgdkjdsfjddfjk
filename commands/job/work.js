import { SlashCommandBuilder } from 'discord.js';
import { jobs } from '../../config/gameData.js';
import { jobCommands } from './registry.js';
import { dbManager } from '../../db/database.js';

export const data = new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work at your job')
    .addStringOption(option =>
        option.setName('job')
            .setDescription('The job to work at')
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
    await interaction.deferReply();
    const jobType = interaction.options.getString('job');

    try {
        // Check if user can work this job
        const canWork = await dbManager.validateJobExecution(interaction.user.id, jobType);
        if (!canWork.canWork) {
            return await interaction.editReply(canWork.message);
        }

        // Execute job handler from registry
        const handler = jobCommands[jobType];
        if (!handler) {
            return await interaction.editReply('Invalid job type');
        }

        const result = await handler(interaction, dbManager);
        await interaction.editReply(result);

    } catch (error) {
        await interaction.editReply(`Failed to work: ${error.message}`);
    }
}

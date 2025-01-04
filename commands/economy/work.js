import { SlashCommandBuilder } from '@discordjs/builders';
import { JOBS, JOB_SYSTEM } from '../../utils/economy.js';
import { formatCurrency } from '../../utils/index.js';

export default {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Work your job to earn money and experience')
        .addStringOption(option =>
            option.setName('job')
                .setDescription('The job to work')
                .setRequired(true)
                .addChoices(
                    ...Object.entries(JOBS).map(([id, job]) => ({
                        name: job.name,
                        value: id
                    }))
                )),

    async execute(interaction) {
        try {
            const jobType = interaction.options.getString('job');
            const result = await JOB_SYSTEM.work(interaction.user.id, jobType);

            let response = `You worked as a ${JOBS[jobType].name} and earned ${formatCurrency(result.salary)}!\n`;
            response += `XP gained: ${result.xpGained}`;

            if (result.leveledUp) {
                response += `\n🎉 Congratulations! You've reached level ${result.newLevel}!`;
            }

            await interaction.reply(response);
        } catch (error) {
            await interaction.reply({ 
                content: 'There was an error while working your job.',
                ephemeral: true
            });
        }
    }
};

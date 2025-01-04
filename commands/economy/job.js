import { SlashCommandBuilder } from '@discordjs/builders';
import { JOBS, JOB_SYSTEM } from '../../utils/economy.js';

export default {
    data: new SlashCommandBuilder()
        .setName('job')
        .setDescription('Manage your jobs')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List available jobs'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('apply')
                .setDescription('Apply for a job')
                .addStringOption(option =>
                    option.setName('job')
                        .setDescription('The job to apply for')
                        .setRequired(true)
                        .addChoices(
                            ...Object.entries(JOBS).map(([id, job]) => ({
                                name: job.name,
                                value: id
                            }))
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('info')
                .setDescription('View your job information')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'list': {
                    const embed = {
                        title: '💼 Available Jobs',
                        fields: Object.entries(JOBS).map(([id, job]) => ({
                            name: job.name,
                            value: `💰 Base Salary: $${job.baseSalary}\n📝 ${job.description}`
                        }))
                    };
                    await interaction.reply({ embeds: [embed] });
                    break;
                }
                case 'apply': {
                    const jobType = interaction.options.getString('job');
                    await JOB_SYSTEM.applyForJob(interaction.user.id, jobType);
                    await interaction.reply(`You've been hired as a ${JOBS[jobType].name}! Use /work to start earning money.`);
                    break;
                }
                case 'info': {
                    const userJobs = await JOB_SYSTEM.getUserJobs(interaction.user.id);
                    if (!userJobs.length) {
                        await interaction.reply('You currently don\'t have any jobs. Use `/job apply` to get started!');
                        return;
                    }

                    const embed = {
                        title: '👔 Your Jobs',
                        fields: userJobs.map(job => ({
                            name: JOBS[job.type].name,
                            value: `Level: ${job.level}\nXP: ${job.xp}/${JOB_SYSTEM.calculateXpNeeded(JOBS[job.type], job.level)}`
                        }))
                    };
                    await interaction.reply({ embeds: [embed] });
                    break;
                }
            }
        } catch (error) {
            await interaction.reply({
                content: 'There was an error processing your job command.',
                ephemeral: true
            });
        }
    }
};

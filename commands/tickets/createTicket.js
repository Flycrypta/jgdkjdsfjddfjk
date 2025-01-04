import { SlashCommandBuilder } from '@discordjs/builders';
import { ticketManager } from '../../utils/ticketSystem.js';

export default {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Create a new support ticket')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('Ticket category')
                .setRequired(true)
                .addChoices(
                    { name: 'General Support', value: 'SUPPORT' },
                    { name: 'Player Report', value: 'REPORT' },
                    { name: 'Billing Support', value: 'BILLING' }
                ))
        .addStringOption(option =>
            option.setName('description')
                .setDescription('Describe your issue')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const category = interaction.options.getString('category');
            const description = interaction.options.getString('description');

            const ticket = await ticketManager.createTicket(interaction, category, description);

            await interaction.reply({
                content: `Ticket #${ticket.id} has been created!`,
                ephemeral: true
            });
        } catch (error) {
            await interaction.reply({
                content: `Error creating ticket: ${error.message}`,
                ephemeral: true
            });
        }
    }
};

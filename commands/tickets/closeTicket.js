import { SlashCommandBuilder } from 'discord.js';
import { dbManager } from '../../db/database.js';
import { EmbedBuilder } from 'discord.js';

export const closeTicketCommand = {
    data: new SlashCommandBuilder()
        .setName('closeticket')
        .setDescription('Close a support ticket')
        .addIntegerOption(option => 
            option.setName('ticketid')
                  .setDescription('ID of the ticket to close')
                  .setRequired(true)),
    
    async execute(interaction) {
        const ticketId = interaction.options.getInteger('ticketid');
        const userId = interaction.user.id;

        try {
            const result = await dbManager.closeTicket(ticketId, userId);
            if (result) {
                const embed = new EmbedBuilder()
                    .setTitle('Ticket Closed')
                    .setDescription(`Ticket ID ${ticketId} has been successfully closed.`)
                    .setColor(0x00FF00);
                await interaction.reply({ embeds: [embed], ephemeral: true });
            } else {
                await interaction.reply({ content: 'Failed to close the ticket. Please ensure the ticket ID is correct.', ephemeral: true });
            }
        } catch (error) {
            console.error(`Error closing ticket ${ticketId} for user ${userId}:`, error);
            await interaction.reply({ content: 'An error occurred while closing the ticket.', ephemeral: true });
        }
    }
};

export default closeTicketCommand;
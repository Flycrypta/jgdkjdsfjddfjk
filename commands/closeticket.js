import { SlashCommandBuilder } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { Database } from '../../database/database.js';
import { DatabaseError } from '../../db/errors/DatabaseError.js';

export const closeticketCommand = {
    data: new SlashCommandBuilder()
        .setName('closeticket')
        .setDescription('Close the current ticket'),

    async execute(interaction) {
        const channelId = interaction.channel.id;
        const userId = interaction.user.id;

        try {
            const result = await dbManager.closeTicket(channelId, userId);
            if (result.changes > 0) {
                const embed = new EmbedBuilder()
                    .setTitle('🎫 Ticket Closed')
                    .setDescription('The ticket has been closed successfully.')
                    .setColor(0x00FF00)
                    .setFooter({ text: 'Ticket Management System', iconURL: 'https://example.com/footer-icon.png' }) // Add a footer
                    .setTimestamp(); // Add a timestamp
                await interaction.reply({ embeds: [embed] });
            } else {
                await interaction.reply('Failed to close the ticket. You might not have permission.');
            }
        } catch (error) {
            console.error('Error closing ticket:', error);
            await interaction.reply('An error occurred while closing the ticket.');
        }
    }
};

export default closeticketCommand;

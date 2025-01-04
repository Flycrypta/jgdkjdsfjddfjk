import { Client } from 'discord.js';
import pkg from 'discord.js';
const { MessageEmbed } = pkg;
import { dbManager } from '../../db/database.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default {
    data: new SlashCommandBuilder()
        .setName('viewtickets')
        .setDescription('View your tickets')
        .addStringOption(option =>
            option.setName('status')
                .setDescription('Filter tickets by status')
                .addChoices(
                    { name: 'Open', value: 'OPEN' },
                    { name: 'Closed', value: 'CLOSED' },
                    { name: 'All', value: 'ALL' }
                )),

    async execute(interaction) {
        try {
            const status = interaction.options.getString('status') || 'ALL';
            const tickets = await dbManager.getUserTickets(interaction.user.id, status);

            if (!tickets.length) {
                await interaction.reply({
                    content: 'You have no tickets to display.',
                    ephemeral: true
                });
                return;
            }

            const embed = new MessageEmbed()
                .setTitle('Your Tickets')
                .setColor('#5865F2')
                .setDescription('Here are your tickets:')
                .addFields(
                    tickets.map(ticket => ({
                        name: `Ticket #${ticket.id} (${ticket.status})`,
                        value: `Category: ${ticket.category}\nCreated: <t:${Math.floor(ticket.createdAt / 1000)}:R>${
                            ticket.closedAt ? `\nClosed: <t:${Math.floor(ticket.closedAt / 1000)}:R>` : ''
                        }`
                    }))
                );

            await interaction.reply({
                embeds: [embed],
                ephemeral: true
            });
        } catch (error) {
            await interaction.reply({
                content: 'Error retrieving tickets.',
                ephemeral: true
            });
        }
    }
};
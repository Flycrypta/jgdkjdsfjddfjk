import pkg from 'discord.js';
const { MessageEmbed, MessageActionRow, MessageButton } = pkg;
import { dbManager } from '../db/database.js';

const TICKET_CONFIG = {
    CATEGORIES: {
        SUPPORT: {
            name: 'General Support',
            color: '#5865F2',
            autoCloseTime: 24 * 60 * 60 * 1000 // 24 hours
        },
        REPORT: {
            name: 'Player Report',
            color: '#ED4245',
            autoCloseTime: 48 * 60 * 60 * 1000 // 48 hours
        },
        BILLING: {
            name: 'Billing Support',
            color: '#57F287',
            autoCloseTime: 12 * 60 * 60 * 1000 // 12 hours
        }
    },
    MAX_OPEN_TICKETS: 3,
    REMINDER_INTERVALS: [1, 12, 23] // Hours before auto-close
};

class TicketManager {
    constructor() {
        this.activeTickets = new Map();
        this.ticketTimers = new Map();
    }

    createTicketEmbed(ticket) {
        const category = TICKET_CONFIG.CATEGORIES[ticket.category];
        return new MessageEmbed()
            .setTitle(`Ticket #${ticket.id}`)
            .setColor(category.color)
            .setDescription(ticket.description)
            .addFields(
                { name: 'Category', value: category.name, inline: true },
                { name: 'Status', value: ticket.status, inline: true },
                { name: 'Created By', value: `<@${ticket.authorId}>`, inline: true },
                { name: 'Time Remaining', value: this.formatTimeRemaining(ticket.closeTime), inline: true }
            )
            .setTimestamp();
    }

    createTicketButtons(ticket) {
        return new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId(`ticket_close_${ticket.id}`)
                    .setLabel('Close Ticket')
                    .setStyle('DANGER'),
                new MessageButton()
                    .setCustomId(`ticket_extend_${ticket.id}`)
                    .setLabel('Extend Time')
                    .setStyle('PRIMARY')
            );
    }

    async createTicket(interaction, category, description) {
        const userTickets = await dbManager.getUserActiveTickets(interaction.user.id);
        if (userTickets.length >= TICKET_CONFIG.MAX_OPEN_TICKETS) {
            throw new Error('You have reached the maximum number of open tickets.');
        }

        const ticket = {
            id: await this.generateTicketId(),
            authorId: interaction.user.id,
            category,
            description,
            status: 'OPEN',
            createdAt: Date.now(),
            closeTime: Date.now() + TICKET_CONFIG.CATEGORIES[category].autoCloseTime
        };

        const embed = this.createTicketEmbed(ticket);
        const buttons = this.createTicketButtons(ticket);

        const message = await interaction.channel.send({
            embeds: [embed],
            components: [buttons]
        });

        ticket.messageId = message.id;
        ticket.channelId = message.channel.id;

        await dbManager.saveTicket(ticket);
        this.activeTickets.set(ticket.id, ticket);
        this.startTicketTimer(ticket);

        return ticket;
    }

    startTicketTimer(ticket) {
        const updateInterval = 60000; // Update every minute
        const timer = setInterval(async () => {
            const timeRemaining = ticket.closeTime - Date.now();
            
            if (timeRemaining <= 0) {
                await this.closeTicket(ticket.id, 'AUTO');
                clearInterval(timer);
                return;
            }

            // Update embed with new time
            try {
                const channel = await client.channels.fetch(ticket.channelId);
                const message = await channel.messages.fetch(ticket.messageId);
                const embed = this.createTicketEmbed({...ticket, closeTime: ticket.closeTime});
                await message.edit({ embeds: [embed] });

                // Send reminders at specified intervals
                const hoursRemaining = timeRemaining / (60 * 60 * 1000);
                if (TICKET_CONFIG.REMINDER_INTERVALS.includes(Math.floor(hoursRemaining))) {
                    await channel.send({
                        content: `<@${ticket.authorId}> This ticket will close in ${this.formatTimeRemaining(ticket.closeTime)}`,
                        allowedMentions: { users: [ticket.authorId] }
                    });
                }
            } catch (error) {
                console.error('Error updating ticket timer:', error);
            }
        }, updateInterval);

        this.ticketTimers.set(ticket.id, timer);
    }

    async closeTicket(ticketId, closeType = 'MANUAL') {
        const ticket = this.activeTickets.get(ticketId);
        if (!ticket) return;

        clearInterval(this.ticketTimers.get(ticketId));
        this.ticketTimers.delete(ticketId);
        this.activeTickets.delete(ticketId);

        ticket.status = 'CLOSED';
        ticket.closedAt = Date.now();
        ticket.closeType = closeType;

        await dbManager.updateTicket(ticket);

        try {
            const channel = await client.channels.fetch(ticket.channelId);
            const message = await channel.messages.fetch(ticket.messageId);
            const embed = this.createTicketEmbed(ticket);
            await message.edit({ 
                embeds: [embed],
                components: [] // Remove buttons
            });
        } catch (error) {
            console.error('Error closing ticket:', error);
        }
    }

    async extendTicket(ticketId, hours = 24) {
        const ticket = this.activeTickets.get(ticketId);
        if (!ticket) return;

        ticket.closeTime = Date.now() + (hours * 60 * 60 * 1000);
        await dbManager.updateTicket(ticket);

        const channel = await client.channels.fetch(ticket.channelId);
        const message = await channel.messages.fetch(ticket.messageId);
        const embed = this.createTicketEmbed(ticket);
        await message.edit({ embeds: [embed] });
    }

    formatTimeRemaining(closeTime) {
        const remaining = closeTime - Date.now();
        if (remaining <= 0) return 'Closing...';

        const hours = Math.floor(remaining / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
        return `${hours}h ${minutes}m`;
    }

    async generateTicketId() {
        const ticketCount = await dbManager.getTicketCount();
        return ticketCount + 1;
    }
}

export const ticketManager = new TicketManager();

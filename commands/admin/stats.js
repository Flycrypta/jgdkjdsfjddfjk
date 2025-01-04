import BaseCommand from '../base-command.js';
import { EmbedBuilder } from 'discord.js';
import fs from 'fs';
import { dbManager } from '../../db/database.js';

export default class StatsCommand extends BaseCommand {
    constructor() {
        super();
        this.data
            .setName('stats')
            .setDescription('Shows statistics')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('bot')
                    .setDescription('Shows bot statistics'))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('player')
                    .setDescription('Shows player statistics')
                    .addUserOption(option =>
                        option.setName('user')
                            .setDescription('The user to check stats for')
                            .setRequired(false)));
    }

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        if (subcommand === 'bot') {
            await this.showBotStats(interaction);
        } else if (subcommand === 'player') {
            await this.showPlayerStats(interaction);
        }
    }

    async showBotStats(interaction) {
        const memoryUsage = process.memoryUsage();
        const uptime = Math.floor(process.uptime());

        const stats = {
            'Memory Usage': `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
            'Uptime': `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${uptime % 60}s`,
            'Servers': `${interaction.client.guilds.cache.size} (Rank ${await this.getBotRank(interaction.client)})`,
            'Users': interaction.client.users.cache.size,
            'Channels': interaction.client.channels.cache.size,
            'Discord.js': 'v14',
            'Node': process.version
        };

        const statsMessage = Object.entries(stats)
            .map(([key, value]) => `**${key}:** ${value}`)
            .join('\n');

        await interaction.reply({
            content: `📊 **Bot Statistics**\n\n${statsMessage}`,
            ephemeral: true
        });
    }

    async showPlayerStats(interaction) {
        const user = interaction.options.getUser('user') || interaction.user;
        const member = interaction.guild.members.cache.get(user.id);

        const stats = {
            'Joined Server': `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`,
            'Account Created': `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`,
            'Server Rank': `#${await this.getMemberRank(member)}`,
            'Roles': member.roles.cache.size - 1,
            'Avatar': user.displayAvatarURL()
        };

        const statsMessage = Object.entries(stats)
            .map(([key, value]) => `**${key}:** ${value}`)
            .join('\n');

        await interaction.reply({
            content: `👤 **Player Statistics for ${user.username}**\n\n${statsMessage}`,
            ephemeral: true
        });
    }

    async getBotRank(client) {
        try {
            const metrics = {
                guildCount: client.guilds.cache.size,
                userCount: client.users.cache.size,
                uptimeHours: Math.floor(process.uptime() / 3600),
                commandCount: client.commands ? client.commands.size : 0
            };

            const score = (
                metrics.guildCount * 10 +
                metrics.userCount * 0.1 +
                metrics.uptimeHours * 5 +
                metrics.commandCount * 2
            );

            const tiers = [
                { threshold: 10000, rank: 'S' },
                { threshold: 5000, rank: 'A' },
                { threshold: 2500, rank: 'B' },
                { threshold: 1000, rank: 'C' },
                { threshold: 500, rank: 'D' },
                { threshold: 0, rank: 'E' }
            ];

            const rank = tiers.find(tier => score >= tier.threshold)?.rank || 'E';
            return `${rank} (Score: ${Math.floor(score)})`;
        } catch (error) {
            console.error('Error calculating bot rank:', error);
            return 'Unknown';
        }
    }

    async getMemberRank(member) {
        const sortedMembers = await member.guild.members.cache
            .sort((a, b) => a.joinedTimestamp - b.joinedTimestamp)
            .map(m => m.id);
        return sortedMembers.indexOf(member.id) + 1;
    }
}

// Write command data to commands.json
const commandData = {
    name: 'stats',
    description: 'Shows statistics',
    type: 1
};

const commandsPath = './commands.json';
let commands = [];

try {
    if (fs.existsSync(commandsPath)) {
        commands = JSON.parse(fs.readFileSync(commandsPath));
    }
    
    const existingCommandIndex = commands.findIndex(cmd => cmd.name === commandData.name);
    if (existingCommandIndex > -1) {
        commands[existingCommandIndex] = commandData;
    } else {
        commands.push(commandData);
    }

    fs.writeFileSync(commandsPath, JSON.stringify(commands, null, 2));
} catch (error) {
    console.error('Error saving command data:', error);
}
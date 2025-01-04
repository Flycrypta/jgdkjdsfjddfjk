import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import BaseCommand from '../base-command.js';

export default class BanCommand extends BaseCommand {
    constructor() {
        super();
        this.data = new SlashCommandBuilder()
            .setName('ban')
            .setDescription('Ban a user from the server')
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user to ban')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('reason')
                    .setDescription('Reason for the ban'))
            .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);
        this.category = 'Moderation';
        this.permissions = ['BanMembers'];
        this.cooldown = 5;
    }

    async execute(interaction) {
        try {
            const target = interaction.options.getUser('user');
            const reason = interaction.options.getString('reason') || 'No reason provided';

            await interaction.guild.members.ban(target, { reason });
            
            const logEmbed = {
                // ...existing code...
            };

            await interaction.reply({
                content: `Banned ${target.tag} for: ${reason}`,
                ephemeral: true
            });
        } catch (error) {
            await this.handleError(interaction, error);
        }
    }
}

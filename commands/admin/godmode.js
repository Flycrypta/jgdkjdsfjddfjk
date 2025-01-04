import { SlashCommandBuilder, PermissionFlagsBits, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import { dbManager } from '../../db/database.js';
import { commandRequirements, commandCooldowns } from '../../config/gameData.js';

const OWNER_ID = 'YOUR_OWNER_ID'; // Replace with actual owner ID

const command = {
    data: new SlashCommandBuilder()
        .setName('godmode')
        .setDescription('Toggle god mode for a user')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user to toggle god mode for')
                .setRequired(true)),

    async execute(interaction) {
        try {
            // Validate admin permissions
            if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({ 
                    content: 'You do not have permission to use this command.', 
                    ephemeral: true 
                });
            }

            const target = interaction.options.getUser('target');
            const userId = interaction.user.id;

            // If user is owner, toggle directly
            if (userId === OWNER_ID) {
                const result = await dbManager.toggleGodMode(target.id);
                return interaction.reply({
                    content: `God mode ${result.enabled ? 'enabled' : 'disabled'} for ${target.username}.`,
                    ephemeral: true
                });
            }

            // For non-owners, create approval request
            const approveButton = new ButtonBuilder()
                .setCustomId(`godmode_approve_${target.id}`)
                .setLabel('Approve')
                .setStyle(ButtonStyle.Success);

            const denyButton = new ButtonBuilder()
                .setCustomId(`godmode_deny_${target.id}`)
                .setStyle(ButtonStyle.Danger)
                .setLabel('Deny');

            const row = new ActionRowBuilder()
                .addComponents(approveButton, denyButton);

            // Send request to owner
            const owner = await interaction.client.users.fetch(OWNER_ID);
            await owner.send({
                content: `${interaction.user.tag} wants to toggle god mode for ${target.tag}. Approve?`,
                components: [row]
            });

            return interaction.reply({
                content: 'Request sent to owner for approval.',
                ephemeral: true
            });

        } catch (error) {
            console.error('Error in godmode command:', error);
            return interaction.reply({
                content: 'An error occurred while processing the command.',
                ephemeral: true
            });
        }
    }
};

export default command;

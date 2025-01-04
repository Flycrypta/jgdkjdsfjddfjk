import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { dbManager } from '../../db/database.js';
import { commandRequirements, commandCooldowns } from '../../config/gameData.js';

export default {
    data: new SlashCommandBuilder()
        .setName('godmode')
        .setDescription('Toggle god mode for admins')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addUserOption(option => 
            option.setName('target')
                .setDescription('User to toggle god mode for')
                .setRequired(true)),

    async execute(interaction) {
        try {
            // Check requirements
            const userId = interaction.user.id;
            const requirements = commandRequirements.godmode;
            
            // Get user data
            const user = await dbManager.getUser(userId);
            if (!user) {
                return interaction.reply({ content: 'User not found.', ephemeral: true });
            }

            // Check level requirement
            if (user.level < requirements.minLevel) {
                return interaction.reply({
                    content: `You need to be level ${requirements.minLevel} to use god mode.`,
                    ephemeral: true
                });
            }

            // Check cooldown
            const cooldown = commandCooldowns.godmode;
            const lastUsed = user.lastGodMode || 0;
            const now = Date.now();
            
            if (now - lastUsed < cooldown) {
                const remainingTime = Math.ceil((cooldown - (now - lastUsed)) / 1000 / 60);
                return interaction.reply({
                    content: `God mode is on cooldown. Try again in ${remainingTime} minutes.`,
                    ephemeral: true
                });
            }

            // Toggle god mode
            const target = interaction.options.getUser('target');
            const result = await dbManager.toggleGodMode(target.id);

            return interaction.reply({
                content: `God mode ${result.enabled ? 'enabled' : 'disabled'} for ${target.username}.`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Error in godmode command:', error);
            return interaction.reply({
                content: 'An error occurred while toggling god mode.',
                ephemeral: true
            });
        }
    }
};

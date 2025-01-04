import { Events } from 'discord.js';
import { dbManager } from '../db/database.js';

const OWNER_ID = 'YOUR_OWNER_ID'; // Replace with actual owner ID

export default {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        
        // Handle godmode approval buttons
        if (interaction.customId.startsWith('godmode_')) {
            if (interaction.user.id !== OWNER_ID) {
                return interaction.reply({
                    content: 'Only the owner can respond to these requests.',
                    ephemeral: true
                });
            }

            const [, action, targetId] = interaction.customId.split('_');
            const target = await interaction.client.users.fetch(targetId);

            if (action === 'approve') {
                const result = await dbManager.toggleGodMode(targetId);
                await interaction.update({
                    content: `God mode ${result.enabled ? 'enabled' : 'disabled'} for ${target.tag}`,
                    components: []
                });
            } else {
                await interaction.update({
                    content: `Denied god mode toggle for ${target.tag}`,
                    components: []
                });
            }
        }
    }
};

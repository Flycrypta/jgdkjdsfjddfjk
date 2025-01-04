import { SlashCommandBuilder } from 'discord.js';
import { Database } from '../../database/database.js';
import { DatabaseError } from '../../db/errors/DatabaseError.js';

export const data = new SlashCommandBuilder()
    .setName('buy')
    .setDescription('Purchase an item by ID.')
    .addIntegerOption(option =>
        option.setName('item_id')
            .setDescription('The ID of the item to buy')
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option.setName('quantity')
            .setDescription('How many to buy')
            .setRequired(true)
    );

export async function execute(interaction) {
    const itemId = interaction.options.getInteger('item_id');
    const quantity = interaction.options.getInteger('quantity') || 1;
    const userId = interaction.user.id;

    try {
        const { cost } = dbManager.purchaseItem(userId, itemId, quantity);
        await interaction.reply({ 
            content: `Successfully purchased ${quantity} of item #${itemId} for ${cost} coins!`,
            ephemeral: true 
        });
    } catch (error) {
        await interaction.reply({ 
            content: `Purchase failed: ${error.message}`,
            ephemeral: true 
        });
    }
}

export default { data, execute };
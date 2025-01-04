import { SlashCommandBuilder } from 'discord.js';
import { CARS } from '../../utils/constants.js';

export const data = new SlashCommandBuilder()
    .setName('trade')
    .setDescription('Trade cars with another user')
    .addUserOption(option =>
        option.setName('user')
            .setDescription('The user to trade with')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('car')
            .setDescription('The car you want to trade')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('wanted')
            .setDescription('The car you want in return')
            .setRequired(true));

export async function execute(interaction) {
    try {
        const { dbManager } = interaction.client;
        const targetUser = interaction.options.getUser('user');
        const carToTrade = interaction.options.getString('car');
        const carWanted = interaction.options.getString('wanted');

        // Check if users exist
        const initiator = await dbManager.getUser(interaction.user.id);
        const target = await dbManager.getUser(targetUser.id);

        if (!initiator || !target) {
            return interaction.reply('One or both users are not registered.');
        }

        // Get user cars
        const initiatorCars = await dbManager.getUserCars(interaction.user.id);
        const targetCars = await dbManager.getUserCars(targetUser.id);

        // Verify ownership
        if (!initiatorCars.find(c => c.id === carToTrade)) {
            return interaction.reply("You don't own this car!");
        }

        if (!targetCars.find(c => c.id === carWanted)) {
            return interaction.reply("The other user doesn't own the car you want!");
        }

        // Create trade
        await dbManager.createTrade({
            id: Date.now().toString(),
            initiatorId: interaction.user.id,
            targetId: targetUser.id,
            carOffered: carToTrade,
            carRequested: carWanted,
            status: 'pending'
        });

        await interaction.reply({
            content: `Trade request sent to ${targetUser.username}!`,
            ephemeral: true
        });

    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error processing the trade.',
            ephemeral: true
        });
    }
}
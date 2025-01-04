import { SlashCommandBuilder } from 'discord.js';
import { Database } from '../../database/database.js';

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
        const targetUser = interaction.options.getUser('user');
        const carToTrade = interaction.options.getString('car');
        const carWanted = interaction.options.getString('wanted');

        // Check if users exist in database
        const initiator = await Database.getUser(interaction.user.id);
        const target = await Database.getUser(targetUser.id);

        if (!initiator || !target) {
            return interaction.reply('One or both users are not registered in the database.');
        }

        // Check if initiator owns the car they want to trade
        if (!initiator.cars.includes(carToTrade)) {
            return interaction.reply("You don't own this car!");
        }

        // Check if target owns the car that initiator wants
        if (!target.cars.includes(carWanted)) {
            return interaction.reply("The other user doesn't own the car you want!");
        }

        // Check if the car is listed in the auction house
        const auctionHouse = await Database.getAuctionHouse();
        if (auctionHouse.includes(carToTrade) || auctionHouse.includes(carWanted)) {
            return interaction.reply("One or both cars are listed in the auction house and cannot be traded.");
        }

        // Create trade request
        await Database.createTrade({
            initiatorId: interaction.user.id,
            targetId: targetUser.id,
            carOffered: carToTrade,
            carRequested: carWanted,
            status: 'pending'
        });

        await interaction.reply({
            content: `Trade request sent to ${targetUser.username}! They need to use /accept-trade to complete the transaction.`,
            ephemeral: true
        });

    } catch (error) {
        console.error(error);
        await interaction.reply({
            content: 'There was an error while processing the trade.',
            ephemeral: true
        });
    }
}
import { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';
import { Database } from '../../database/database.js';
import { DatabaseError } from '../../db/errors/DatabaseError.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('trade')
        .setDescription('Trade cars with another user')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user to trade with')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('cars')
                .setDescription('The cars you want to trade (comma-separated)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('wanted')
                .setDescription('The cars you want in return (comma-separated)')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const targetUser = interaction.options.getUser('user');
            const carsToTrade = interaction.options.getString('cars').split(',').map(car => car.trim());
            const carsWanted = interaction.options.getString('wanted').split(',').map(car => car.trim());

            // Validate input arrays
            if (carsToTrade.length === 0 || carsWanted.length === 0) {
                throw new DatabaseError('TRADE', {
                    message: 'Invalid trade items specified',
                    userMessage: 'Please specify at least one car to trade and one car to receive.'
                });
            }

            // Check ownership for all cars
            const initiatorCars = await Database.getUserCars(interaction.user.id);
            const targetCars = await Database.getUserCars(targetUser.id);

            const missingInitiatorCars = carsToTrade.filter(car => !initiatorCars.includes(car));
            const missingTargetCars = carsWanted.filter(car => !targetCars.includes(car));

            if (missingInitiatorCars.length > 0 || missingTargetCars.length > 0) {
                let errorMsg = '';
                if (missingInitiatorCars.length > 0) {
                    errorMsg += `You don't own: ${missingInitiatorCars.join(', ')}\n`;
                }
                if (missingTargetCars.length > 0) {
                    errorMsg += `${targetUser.username} doesn't own: ${missingTargetCars.join(', ')}`;
                }
                return interaction.reply({ content: errorMsg, ephemeral: true });
            }

            // Create trade request
            await Database.createTrade({
                initiatorId: interaction.user.id,
                targetId: targetUser.id,
                itemsOffered: carsToTrade,
                itemsRequested: carsWanted,
                status: 'pending',
                timestamp: new Date().toISOString()
            });

            const suggestionEmbed = {
                title: '💡 Trading Tips',
                description: 'Consider these suggestions:',
                fields: [
                    {
                        name: '🔄 Counter Offers',
                        value: 'The other player can make counter offers using `/counter-trade`'
                    },
                    {
                        name: '⚖️ Fair Value',
                        value: `Total value of cars offered: ${await Database.calculateCarsValue(carsToTrade)}\nTotal value of cars wanted: ${await Database.calculateCarsValue(carsWanted)}`
                    }
                ]
            };

            await interaction.reply({
                content: `Trade request sent to ${targetUser.username}! They need to use /accept-trade to complete the transaction.`,
                embeds: [suggestionEmbed],
                ephemeral: true
            });

        } catch (error) {
            if (error instanceof DatabaseError) {
                const handled = DatabaseError.handle(error);
                await interaction.reply({ content: handled.userMessage, ephemeral: true });
            } else {
                console.error(error);
                await interaction.reply({
                    content: 'There was an error while processing the trade.',
                    ephemeral: true
                });
            }
        }
    },
};
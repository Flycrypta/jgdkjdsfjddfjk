import { SlashCommandBuilder } from 'discord.js';
import { ErrorHandler, ErrorTypes } from '../../utils/errors/ErrorHandler.js';
import { ValidationHandler } from '../../utils/errors/ValidationHandler.js';
import { RACE_CONFIGS } from '../../config/races.js';

export const data = new SlashCommandBuilder()
    .setName('race')
    .setDescription('Start a race')
    .addStringOption(option =>
        option.setName('type')
            .setDescription('Type of race')
            .setRequired(true)
            .addChoices(
                { name: 'Sprint', value: 'sprint' },
                { name: 'Circuit', value: 'circuit' },
                { name: 'Drift', value: 'drift' }
            ))
    .addStringOption(option =>
        option.setName('car_id')
            .setDescription('Which car to use')
            .setRequired(true));

export async function execute(interaction) {
    try {
        // Advanced input validation
        ValidationHandler.validate({
            raceType: interaction.options.getString('type'),
            carId: interaction.options.getString('car_id')
        }, {
            raceType: [
                { name: 'required' },
                { name: 'custom', param: (v) => Object.keys(RACE_CONFIGS).includes(v) }
            ],
            carId: [
                { name: 'required' },
                { name: 'pattern', param: /^\d+$/ }
            ]
        });

        const raceType = interaction.options.getString('type');
        const carId = interaction.options.getString('car_id');
        const userId = interaction.user.id;

        // Get car with error context
        const car = await interaction.client.dbManager.getUserCar(userId, carId)
            .catch(err => {
                throw {
                    name: ErrorTypes.RACE,
                    message: "Failed to fetch car data",
                    details: err,
                    context: { userId, carId }
                };
            });

        if (!car) {
            throw {
                name: ErrorTypes.VALIDATION,
                message: "Car not owned",
                context: { userId, carId }
            };
        }

        // Validate car condition
        if (car.condition < 20) {
            throw {
                name: ErrorTypes.RACE,
                message: "Car needs repairs",
                context: { carId, condition: car.condition }
            };
        }

        // Join race lobby with error handling
        const lobby = await interaction.client.raceManager.findOrCreateLobby(raceType);
        await lobby.addPlayer({ userId, car, interaction });

        return interaction.reply({
            content: "Joined race lobby! Waiting for other racers...",
            ephemeral: true
        });

    } catch (error) {
        await ErrorHandler.handle(error, interaction);
    }
}

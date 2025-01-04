import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { resolveImportPath } from '../../utils/paths.js';
import { dbManager } from resolveImportPath('../../db/database.js');
import BaseCommand from resolveImportPath('../base-command.js');
import { CAR_MODS } from resolveImportPath('../../utils/index.js');

const serviceTypes = {
    basic: {
        name: 'Basic Service',
        cost: 500,
        cooldown: 24, // hours
        effects: {
            reliability: 1.1,
            performance: 1.05,
            duration: 72 // hours
        }
    },
    major: {
        name: 'Major Service',
        cost: 2500,
        cooldown: 168, // 7 days
        effects: {
            reliability: 1.25,
            performance: 1.15,
            duration: 168
        }
    },
    performance: {
        name: 'Performance Service',
        cost: 5000,
        cooldown: 72,
        effects: {
            reliability: 1.15,
            performance: 1.3,
            duration: 96
        }
    }
};

export const data = new SlashCommandBuilder()
    .setName('service')
    .setDescription('Service your car')
    .addStringOption(option =>
        option.setName('type')
            .setDescription('Type of service')
            .setRequired(true)
            .addChoices(
                { name: 'Basic Service', value: 'basic' },
                { name: 'Major Service', value: 'major' },
                { name: 'Performance Service', value: 'performance' }
            ))
    .addIntegerOption(option =>
        option.setName('car_id')
            .setDescription('ID of the car to service')
            .setRequired(true));

export default class ServiceCommand extends BaseCommand {
    constructor() {
        super();
    }

    async execute(interaction) {
        const type = interaction.options.getString('type');
        const carId = interaction.options.getInteger('car_id');
        const userId = interaction.user.id;

        try {
            // Check if user owns the car
            const car = await dbManager.getUserCar(userId, carId);
            if (!car) {
                return await interaction.reply({ content: 'You don\'t own this car!', ephemeral: true });
            }

            const service = serviceTypes[type];

            // Check cooldown
            const lastService = await dbManager.getLastService(carId);
            if (lastService) {
                const hoursSinceService = (Date.now() - lastService.timestamp) / (1000 * 60 * 60);
                if (hoursSinceService < service.cooldown) {
                    return await interaction.reply({
                        content: `This car was recently serviced. Wait ${Math.ceil(service.cooldown - hoursSinceService)} hours.`,
                        ephemeral: true
                    });
                }
            }

            // Check if user can afford it
            const userBalance = await dbManager.getCoins(userId);
            if (userBalance < service.cost) {
                return await interaction.reply({
                    content: `You need ${service.cost} coins for this service. Current balance: ${userBalance}`,
                    ephemeral: true
                });
            }

            // Perform service
            await dbManager.serviceCarTransaction(userId, carId, {
                cost: service.cost,
                effects: service.effects,
                type: type
            });

            const embed = new EmbedBuilder()
                .setTitle('🔧 Car Service Complete')
                .setDescription(`Your ${car.name} has been serviced!`)
                .addFields(
                    { name: 'Service Type', value: service.name },
                    { name: 'Cost', value: `${service.cost} coins` },
                    { name: 'Effects', value: `Performance: +${Math.round((service.effects.performance - 1) * 100)}%\nReliability: +${Math.round((service.effects.reliability - 1) * 100)}%` },
                    { name: 'Duration', value: `${service.effects.duration} hours` }
                )
                .setColor('#00FF00')
                .setTimestamp();

            await interaction.reply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error('Service error:', error);
            await interaction.reply({
                content: 'There was an error servicing your car.',
                ephemeral: true
            });
        }
    }
}

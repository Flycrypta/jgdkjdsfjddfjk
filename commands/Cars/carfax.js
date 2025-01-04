import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { promises as fs } from 'fs';
import BaseCommand from '../base-command.js';
import { dbManager } from '../../db/database.js';

const carsPath = './data/cars.json';

export default class CarfaxCommand extends BaseCommand {
    constructor() {
        super();
        this.data = new SlashCommandBuilder()
            .setName('carfax')
            .setDescription('View detailed vehicle history')
            .addStringOption(option =>
                option.setName('vin')
                    .setDescription('Vehicle Identification Number')
                    .setRequired(true));
        this.category = 'Cars';
        this.permissions = [];
        this.cooldown = 5;
    }

    async execute(interaction) {
        try {
            const vin = interaction.options.getString('vin');
            const history = await dbManager.getCarHistory(vin);

            if (!history) {
                return interaction.reply('No vehicle found with that VIN.');
            }

            const embed = new EmbedBuilder()
                .setTitle(`Vehicle History - ${history.car.name}`)
                .setDescription(`VIN: ${vin}`)
                .addFields([
                    { name: 'Previous Owners', value: history.owners.toString() },
                    { name: 'Current Mileage', value: `${history.mileage.toLocaleString()} miles` },
                    { name: 'Accidents', value: history.accidents.toString() },
                    { name: 'Service Records', value: history.services.length.toString() }
                ])
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await this.handleError(interaction, error);
        }
    }
}

// Helper function moved outside the class
async function recordNewCar(userId, carName) {
    try {
        let carsData = {};
        try {
            const data = await fs.readFile(carsPath, 'utf8');
            carsData = JSON.parse(data);
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }

        if (!carsData[userId]) {
            carsData[userId] = [];
        }

        carsData[userId].push({
            name: carName,
            obtainedDate: Date.now(),
            rarity: 'Unknown',
            value: 0
        });

        await fs.writeFile(carsPath, JSON.stringify(carsData, null, 2));
    } catch (error) {
        console.error('Error updating carfax:', error);
    }
}

export { recordNewCar };
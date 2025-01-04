import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { dbManager } from '../db/database.js';
import { CAR_MODS } from '../utils/index.js';
import { Database } from '../../database/database.js';
import { DatabaseError } from '../../db/errors/DatabaseError.js';

function checkGarageAccess(user) {
    return user.unlockedCars.length >= 5 && user.status === 'dealership';
}

function serviceCar(user, carId) {
    if (!checkGarageAccess(user)) {
        return 'Access denied. You need to unlock at least 5 cars and have dealership status.';
    }
    // Logic for servicing the car
    return `Car with ID ${carId} has been serviced.`;
}

function upgradeCar(user, carId, modId) {
    if (!checkGarageAccess(user)) {
        return 'Access denied. You need to unlock at least 5 cars and have dealership status.';
    }
    // Logic for upgrading the car
    return `Car with ID ${carId} has been upgraded with modification ID ${modId}.`;
}

function buyCarWholesale(user, carId) {
    if (user.status !== 'dealership') {
        return 'Access denied. Only users with dealership status can buy cars wholesale.';
    }
    // Logic for buying car wholesale
    return `Car with ID ${carId} has been bought wholesale.`;
}

function sellCarWholesale(user, carId) {
    if (user.status !== 'dealership') {
        return 'Access denied. Only users with dealership status can sell cars wholesale.';
    }
    // Logic for selling car wholesale
    return `Car with ID ${carId} has been sold wholesale.`;
}

function auctionCar(user, carId) {
    if (user.status !== 'dealership') {
        return 'Access denied. Only users with dealership status can auction cars.';
    }
    // Logic for auctioning the car
    return `Car with ID ${carId} has been put up for auction.`;
}

export const data = new SlashCommandBuilder()
    .setName('garage')
    .setDescription('Manage your garage and cars')
    .addSubcommand(subcommand =>
        subcommand
            .setName('view')
            .setDescription('View your garage'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('modify')
            .setDescription('Modify a car')
            .addStringOption(option =>
                option.setName('car_id')
                    .setDescription('The ID of the car to modify')
                    .setRequired(true))
            .addStringOption(option =>
                option.setName('mod_type')
                    .setDescription('Type of modification')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Engine', value: 'Engine' },
                        { name: 'Exhaust', value: 'Exhaust' },
                        { name: 'Suspension', value: 'Suspension' }
                    ))
            .addStringOption(option =>
                option.setName('part')
                    .setDescription('Specific part to install')
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('sell')
            .setDescription('Sell a car')
            .addStringOption(option =>
                option.setName('car_id')
                    .setDescription('The ID of the car to sell')
                    .setRequired(true)));

export async function execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    try {
        switch (subcommand) {
            case 'view':
                await handleViewGarage(interaction);
                break;
            case 'modify':
                await handleModifyCar(interaction);
                break;
            case 'sell':
                await handleSellCar(interaction);
                break;
        }
    } catch (error) {
        console.error('Garage command error:', error);
        await interaction.reply({
            content: 'An error occurred while processing the garage command.',
            ephemeral: true
        });
    }
}

async function handleViewGarage(interaction) {
    const userId = interaction.user.id;
    const cars = await dbManager.getUserCars(userId);

    if (!cars.length) {
        await interaction.reply('Your garage is empty!');
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle('🏎️ Your Garage')
        .setColor('#00ff00')
        .setTimestamp();

    cars.forEach(car => {
        embed.addFields({
            name: `${car.name} (ID: ${car.id})`,
            value: `💪 Power: ${car.base_hp}hp\n💨 Performance: ${calculatePerformance(car)}%\n💰 Value: ${car.value}`,
            inline: true
        });
    });

    await interaction.reply({ embeds: [embed] });
}

async function handleModifyCar(interaction) {
    const userId = interaction.user.id;
    const carId = interaction.options.getString('car_id');
    const modType = interaction.options.getString('mod_type');
    const partChoice = interaction.options.getString('part');

    // Get car and validate ownership
    const car = await dbManager.getUserCar(userId, carId);
    if (!car) {
        await interaction.reply('You don\'t own this car!');
        return;
    }

    // Get modification details
    const mod = CAR_MODS[modType]?.[partChoice];
    if (!mod) {
        await interaction.reply('Invalid modification selected!');
        return;
    }

    // Check compatibility
    if (!isModCompatible(car, mod)) {
        await interaction.reply('This modification is not compatible with your car!');
        return;
    }

    // Check if user can afford the mod
    const userBalance = await dbManager.getCoins(userId);
    if (userBalance < mod.value) {
        await interaction.reply(`You need ${mod.value} coins for this modification!`);
        return;
    }

    // Apply modification
    await dbManager.applyCarMod(userId, carId, mod);
    await dbManager.updateCoins(userId, -mod.value);

    const embed = new EmbedBuilder()
        .setTitle('🔧 Car Modified')
        .setDescription(`Successfully installed ${mod.brand} ${partChoice}!`)
        .addFields(
            { name: 'HP Gain', value: `+${mod.hpGain}`, inline: true },
            { name: 'Cost', value: `${mod.value}`, inline: true }
        )
        .setColor('#00ff00');

    await interaction.reply({ embeds: [embed] });
}

async function handleSellCar(interaction) {
    const userId = interaction.user.id;
    const carId = interaction.options.getString('car_id');

    // Get car and validate ownership
    const car = await dbManager.getUserCar(userId, carId);
    if (!car) {
        await interaction.reply('You don\'t own this car!');
        return;
    }

    // Calculate sell price (e.g., 75% of value)
    const sellPrice = Math.floor(car.value * 0.75);

    // Process sale
    await dbManager.removeCar(userId, carId);
    await dbManager.updateCoins(userId, sellPrice);

    const embed = new EmbedBuilder()
        .setTitle('💰 Car Sold')
        .setDescription(`Successfully sold ${car.name}!`)
        .addFields(
            { name: 'Sale Price', value: `${sellPrice}`, inline: true }
        )
        .setColor('#00ff00');

    await interaction.reply({ embeds: [embed] });
}

function calculatePerformance(car) {
    let basePerformance = 100;
    if (car.mods) {
        basePerformance += car.mods.reduce((total, mod) => total + (mod.hpGain || 0), 0);
    }
    return basePerformance;
}

function isModCompatible(car, mod) {
    if (mod.compatibility.includes('all')) return true;
    return mod.compatibility.includes(car.region);
}

export default { data, execute };
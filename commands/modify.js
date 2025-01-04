import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { dbManager } from '../db/database.js';
import { Decimal } from 'decimal.js';

export const data = new SlashCommandBuilder()
    .setName('modify')
    .setDescription('Modify your car')
    .addStringOption(option =>
        option.setName('car_id')
            .setDescription('The ID of your car')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('mod_type')
            .setDescription('Type of modification')
            .setRequired(true)
            .addChoices(
                { name: 'Engine', value: 'engine' },
                { name: 'Suspension', value: 'suspension' },
                { name: 'Brakes', value: 'brakes' },
                { name: 'Transmission', value: 'transmission' },
                { name: 'Turbo', value: 'turbo' },
                { name: 'Bodykit', value: 'bodykit' },
                { name: 'Interior', value: 'interior' },
                { name: 'Wheels', value: 'wheels' }
            ));

export async function execute(interaction) {
    try {
        const carId = interaction.options.getString('car_id');
        const modType = interaction.options.getString('mod_type');
        const userId = interaction.user.id;

        // Check if user owns the car
        const ownedCar = await dbManager.getUserCar(userId, carId);
        if (!ownedCar) {
            return await interaction.reply({
                content: "You don't own this car!",
                ephemeral: true
            });
        }

        // Get car's current modifications
        const carMods = ownedCar.properties?.mods || [];
        const existingMod = carMods.find(mod => mod.type === modType);

        // Calculate modification costs and effects
        const modInfo = calculateModification(ownedCar, modType, existingMod);
        
        // Check if user can afford the modification
        const userBalance = await dbManager.getUserBalance(userId);
        if (userBalance < modInfo.cost) {
            return await interaction.reply({
                content: `You need ${modInfo.cost} coins for this modification!`,
                ephemeral: true
            });
        }

        // Apply the modification
        await dbManager.applyCarModification(userId, carId, {
            type: modType,
            level: (existingMod?.level || 0) + 1,
            stats: modInfo.newStats
        });

        // Update car value
        const newValue = calculateNewCarValue(ownedCar, modInfo);
        await dbManager.updateCarValue(carId, newValue);

        // Create response embed
        const embed = new EmbedBuilder()
            .setTitle('🔧 Car Modification')
            .setDescription(`Modified ${ownedCar.name}`)
            .addFields(
                { name: 'Modification', value: modType },
                { name: 'Cost', value: `${modInfo.cost} coins` },
                { name: 'Performance Gain', value: `+${modInfo.performanceGain}%` },
                { name: 'New Value', value: `${newValue} coins` }
            )
            .setColor('#00FF00');

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });

    } catch (error) {
        console.error('Modification error:', error);
        await interaction.reply({
            content: 'Failed to modify car: ' + error.message,
            ephemeral: true
        });
    }
}

function calculateModification(car, modType, existingMod) {
    const baseCost = {
        engine: 10000,
        suspension: 5000,
        brakes: 3000,
        transmission: 7000,
        turbo: 15000,
        bodykit: 8000,
        interior: 2000,
        wheels: 4000
    }[modType];

    const currentLevel = existingMod?.level || 0;
    const costMultiplier = new Decimal(1.5).pow(currentLevel);
    const cost = new Decimal(baseCost).times(costMultiplier);

    // Calculate performance gains
    const baseGain = {
        engine: 15,
        suspension: 10,
        brakes: 8,
        transmission: 12,
        turbo: 20,
        bodykit: 5,
        interior: 2,
        wheels: 7
    }[modType];

    const performanceGain = baseGain / (currentLevel + 1);

    // Calculate new stats
    const newStats = {
        horsepower: car.baseHp * (1 + (performanceGain / 100)),
        handling: car.handling * (1 + (performanceGain / 200)),
        acceleration: car.acceleration * (1 + (performanceGain / 150))
    };

    return {
        cost: cost.toNumber(),
        performanceGain,
        newStats
    };
}

function calculateNewCarValue(car, modInfo) {
    const baseValue = new Decimal(car.price);
    const modValue = new Decimal(modInfo.cost);
    const performanceMultiplier = new Decimal(1 + (modInfo.performanceGain / 100));
    
    return baseValue
        .plus(modValue)
        .times(performanceMultiplier)
        .round()
        .toNumber();
}

export default { data, execute };

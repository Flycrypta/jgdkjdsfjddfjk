import { SlashCommandBuilder } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { dbManager } from '../db/database.js';
import { CAR_MODS, MECHANICS as GameMechanics } from '../utils/index.js';
import { Database } from '../../database/database.js';
import { DatabaseError } from '../../db/errors/DatabaseError.js';

const CAR_HELP_CATEGORY = {
    name: 'Car Management',
    commands: [
        { name: 'register', description: 'Register a new car', permission: 'Everyone' },
        { name: 'list', description: 'List your cars', permission: 'Everyone' },
        { name: 'carfax', description: 'View car history', permission: 'Car Owner' },
        // ... add other commands
    ]
};

// Car command verification middleware
async function verifyCarOwnership(interaction, vin) {
    const car = await dbManager.getCarDetails(vin);
    return car && car.owner_id === interaction.user.id;
}

export const carCommands = {
    category: CAR_HELP_CATEGORY,
    data: new SlashCommandBuilder()
        .setName('car')
        .setDescription('Car management system')
        // Basic Commands
        .addSubcommandGroup(group =>
            group.setName('basic')
                .setDescription('Basic car commands')
                .addSubcommand(subcommand =>
                    subcommand.setName('register')
                        .setDescription('Register a new car')
                        .addStringOption(option => option.setName('vin').setDescription('VIN').setRequired(true))
                        .addStringOption(option => option.setName('make').setDescription('Manufacturer').setRequired(true))
                        .addStringOption(option => option.setName('model').setDescription('Model').setRequired(true))
                        .addIntegerOption(option => option.setName('year').setDescription('Year').setRequired(true)))
                .addSubcommand(subcommand =>
                    subcommand.setName('list')
                        .setDescription('List your cars')))
        // Maintenance Commands
        .addSubcommandGroup(group =>
            group.setName('maintenance')
                .setDescription('Car maintenance commands')
                // ... add maintenance subcommands
        )
        // Service Commands
        .addSubcommandGroup(group =>
            group.setName('service')
                .setDescription('Car service commands')
                // ... add service subcommands
        )
        // Performance Commands
        .addSubcommandGroup(group =>
            group.setName('performance')
                .setDescription('Car performance commands')
                // ... add performance subcommands
        ),

    async execute(interaction) {
        const group = interaction.options.getSubcommandGroup();
        const subcommand = interaction.options.getSubcommand();
        const vin = interaction.options.getString('vin');

        // Auto-register user if not registered
        await dbManager.addUser(interaction.user.id, interaction.user.username);

        try {
            // Handle command groups
            switch (group) {
                case 'basic':
                    await handleBasicCommands(interaction, subcommand);
                    break;
                case 'maintenance':
                    if (vin && !(await verifyCarOwnership(interaction, vin))) {
                        return interaction.reply({ content: 'You don\'t own this car!', ephemeral: true });
                    }
                    await handleMaintenanceCommands(interaction, subcommand);
                    break;
                // ... handle other command groups
            }
        } catch (error) {
            console.error('Car command error:', error);
            await interaction.reply({
                content: 'An error occurred while processing the car command.',
                ephemeral: true
            });
        }
    }
};

async function handleBasicCommands(interaction, subcommand) {
    switch (subcommand) {
        case 'register':
            await handleRegisterCar(interaction);
            break;
        case 'list':
            await handleListCars(interaction);
            break;
    }
}

// Add command handlers...

async function handleRegisterCar(interaction) {
    const vin = interaction.options.getString('vin');
    const make = interaction.options.getString('make');
    const model = interaction.options.getString('model');
    const year = interaction.options.getInteger('year');

    try {
        await dbManager.registerCar(vin, make, model, year, interaction.user.id);
        const car = await dbManager.getCarDetails(vin);

        const embed = new EmbedBuilder()
            .setTitle('🚗 Car Registered')
            .setDescription(`Successfully registered ${year} ${make} ${model}`)
            .setColor(0x00FF00)
            .setThumbnail('https://example.com/car-thumbnail.png') // Add a thumbnail image
            .addFields(
                { name: 'VIN', value: vin, inline: true },
                { name: 'Make', value: make, inline: true },
                { name: 'Model', value: model, inline: true },
                { name: 'Year', value: year.toString(), inline: true }
            )
            .setFooter({ text: 'Car Management System', iconURL: 'https://example.com/footer-icon.png' }) // Add a footer
            .setTimestamp(); // Add a timestamp
        await interaction.reply({ embeds: [embed] });

        // Assign role based on car rarity
        const rarityRoleMap = {
            'legendary': 'Legendary Car Owner',
            'epic': 'Epic Car Owner',
            'rare': 'Rare Car Owner'
        };

        const roleName = rarityRoleMap[car.rarity];
        if (roleName) {
            const role = interaction.guild.roles.cache.find(r => r.name === roleName);
            if (role) {
                await interaction.member.roles.add(role);
                await interaction.followUp({ content: `You have been assigned the role: ${roleName}`, ephemeral: true });
            }
        }
    } catch (error) {
        throw new Error('Failed to register car: ' + error.message);
    }
}

async function handleListCars(interaction) {
    try {
        const cars = await dbManager.getCars(interaction.user.id);
        if (cars.length === 0) {
            return interaction.reply('You have no registered cars.');
        }

        const embed = new EmbedBuilder()
            .setTitle('🚗 Your Cars')
            .setColor(0x0099FF)
            .setDescription('Here is a list of your registered cars:')
            .setThumbnail('https://example.com/car-list-thumbnail.png') // Add a thumbnail image
            .setFooter({ text: 'Car Management System', iconURL: 'https://example.com/footer-icon.png' }) // Add a footer
            .setTimestamp(); // Add a timestamp

        cars.forEach(car => {
            embed.addFields(
                { name: `${car.year} ${car.make} ${car.model}`, value: `VIN: ${car.vin}`, inline: false }
            );
        });

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        throw new Error('Failed to list cars: ' + error.message);
    }
}

// Continue implementing other handlers...

export default carCommands;

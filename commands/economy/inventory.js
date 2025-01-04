const { SlashCommandBuilder, Collection } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const User = require('../../models/User');
const Car = require('../../models/Car');
const { calculateRaceResult } = require('../../utils/racing');
const { applyModification, MODIFICATIONS } = require('../../utils/modifications');
const { calculateJobReward } = require('../../utils/economy');
const { calculateRepairCost } = require('../../utils/maintenance');

// Add cooldowns collection
const cooldowns = new Collection();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('garage')
        .setDescription('Manage your virtual car garage')
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View your garage'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('sort')
                .setDescription('Sort your garage')
                .addStringOption(option =>
                    option.setName('by')
                        .setDescription('Sort by parameter')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Name', value: 'name' },
                            { name: 'Value', value: 'value' },
                            { name: 'Performance', value: 'performance' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('auction')
                .setDescription('Manage your auctions')
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Auction action')
                        .setRequired(true)
                        .addChoices(
                            { name: 'List', value: 'list' },
                            { name: 'Buyout', value: 'buyout' },
                            { name: 'View', value: 'view' }
                        ))
                .addStringOption(option =>
                    option.setName('item')
                        .setDescription('Item to auction or buyout')
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Buyout amount')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('job')
                .setDescription('Work a job')
                .addStringOption(option =>
                    option.setName('job')
                        .setDescription('Job to work')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Driver', value: 'driver' },
                            { name: 'Mechanic', value: 'mechanic' },
                            { name: 'Dealer', value: 'dealer' },
                            { name: 'Designer', value: 'designer' },
                            { name: 'Engineer', value: 'engineer' },
                            { name: 'Salesperson', value: 'salesperson' },
                            { name: 'Manager', value: 'manager' },
                            { name: 'Cleaner', value: 'cleaner' },
                            { name: 'Security', value: 'security' },
                            { name: 'Tester', value: 'tester' },
                            { name: 'Fast Food Worker', value: 'fast_food_worker' },
                            { name: 'Criminal', value: 'criminal' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('mod')
                .setDescription('Modify your car')
                .addStringOption(option =>
                    option.setName('car')
                        .setDescription('Car to modify')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('mod')
                        .setDescription('Modification to apply')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('race')
                .setDescription('Race with your car')
                .addStringOption(option =>
                    option.setName('car')
                        .setDescription('Car to race with')
                        .setRequired(true))
                .addUserOption(option =>
                    option.setName('opponent')
                        .setDescription('User to race against')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('trade')
                .setDescription('Trade items with another user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to trade with')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('item')
                        .setDescription('Item to trade')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Amount of item to trade')
                        .setRequired(true))),

    async execute(interaction) {
        // Check cooldown
        const cooldownTime = 5; // seconds
        if (cooldowns.has(interaction.user.id)) {
            const expirationTime = cooldowns.get(interaction.user.id) + (cooldownTime * 1000);
            if (Date.now() < expirationTime) {
                const timeLeft = (expirationTime - Date.now()) / 1000;
                return interaction.reply({ 
                    content: `Please wait ${timeLeft.toFixed(1)} seconds before using this command again.`,
                    ephemeral: true 
                });
            }
        }
        cooldowns.set(interaction.user.id, Date.now());

        try {
            const subcommand = interaction.options.getSubcommand();
            switch(subcommand) {
                case 'view':
                    await handleView(interaction);
                    break;
                case 'sort':
                    await handleSort(interaction);
                    break;
                case 'auction':
                    await handleAuction(interaction);
                    break;
                case 'job':
                    await handleJob(interaction);
                    break;
                case 'mod':
                    await handleMod(interaction);
                    break;
                case 'race':
                    await handleRace(interaction);
                    break;
                case 'trade':
                    await handleTrade(interaction);
                    break;
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ 
                content: 'There was an error executing this command!',
                ephemeral: true 
            });
        }
    },
};

async function handleView(interaction) {
    try {
        const user = await User.findOne({ userId: interaction.user.id })
            .populate('inventory');

        if (!user) {
            return interaction.reply('Please create a profile first using /profile create');
        }

        const itemsPerPage = 10;
        const page = 1;

        const carsEmbed = new EmbedBuilder()
            .setTitle('🚗 Your Garage')
            .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
            .setDescription(user.inventory.length > 0 
                ? user.inventory.map(car => 
                    `${car.name} (${car.condition}%) - Value: $${car.value.toLocaleString()}`
                ).join('\n')
                : 'No cars in garage')
            .setFooter({ text: `Balance: $${user.balance.toLocaleString()}` })
            .setColor('#0099ff');

        await interaction.reply({ embeds: [carsEmbed] });
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Error fetching garage data', ephemeral: true });
    }
}

async function handleSort(interaction) {
    const sortBy = interaction.options.getString('by');
    // Implement proper sorting logic
    const validSort = ['name', 'value', 'performance'].includes(sortBy);
    if (!validSort) {
        return interaction.reply({ 
            content: 'Invalid sort parameter!',
            ephemeral: true 
        });
    }
    // Add sorting implementation here
}

async function handleAuction(interaction) {
    const action = interaction.options.getString('action');
    const item = interaction.options.getString('item');
    const amount = interaction.options.getInteger('amount');

    // Validate input
    if (action === 'buyout' && (!amount || amount <= 0)) {
        return interaction.reply({ 
            content: 'Please specify a valid amount for buyout!',
            ephemeral: true 
        });
    }

    // Add auction implementation
}

async function handleJob(interaction) {
    const job = interaction.options.getString('job');
    // Add job progression system
    const jobTiers = {
        'fast_food_worker': 1,
        'cleaner': 1,
        'security': 2,
        'driver': 2,
        'mechanic': 3,
        // ... other jobs with their tiers
    };

    // Add cooldown specific to jobs
    const jobCooldown = 3600000; // 1 hour
    // Implement job rewards and progression
}

async function handleMod(interaction) {
    const car = interaction.options.getString('car');
    const mod = interaction.options.getString('mod');
    
    // Validate car ownership and mod compatibility
    // Implement modification system
}

async function handleRace(interaction) {
    const carName = interaction.options.getString('car');
    const opponent = interaction.options.getUser('opponent');

    try {
        const user = await User.findOne({ userId: interaction.user.id })
            .populate('inventory');
        
        const car = user.inventory.find(c => c.name.toLowerCase() === carName.toLowerCase());
        if (!car) return interaction.reply('Car not found in your garage!');

        if (car.condition < 20) {
            return interaction.reply('Your car needs repairs before racing!');
        }

        let raceResult;
        if (opponent) {
            const oppUser = await User.findOne({ userId: opponent.id })
                .populate('inventory');
            if (!oppUser) return interaction.reply('Opponent needs to create a profile first!');

            const oppCar = oppUser.inventory[0]; // Assuming first car, you might want to let them choose
            raceResult = calculateRaceResult(car, oppCar, 'circuit');
        } else {
            // AI opponent logic here
        }

        // Update car condition and user stats
        car.condition -= Math.floor(Math.random() * 10) + 5;
        await car.save();
        
        await interaction.reply(`Race completed! ${raceResult.winner.name} won!`);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Error during race', ephemeral: true });
    }
}

async function handleTrade(interaction) {
    const targetUser = interaction.options.getUser('user');
    const item = interaction.options.getString('item');
    const amount = interaction.options.getInteger('amount');

    if (targetUser.id === interaction.user.id) {
        return interaction.reply({ content: 'You cannot trade with yourself!', ephemeral: true });
    }

    try {
        const user = await User.findOne({ userId: interaction.user.id });
        const target = await User.findOne({ userId: targetUser.id });

        if (!user || !target) {
            return interaction.reply({ content: 'Both users must have a profile to trade.', ephemeral: true });
        }

        const userItem = user.inventory.find(i => i.name.toLowerCase() === item.toLowerCase());
        if (!userItem || userItem.amount < amount) {
            return interaction.reply({ content: 'You do not have enough of the specified item to trade.', ephemeral: true });
        }

        // Remove item from user's inventory
        userItem.amount -= amount;
        if (userItem.amount === 0) {
            user.inventory = user.inventory.filter(i => i.name.toLowerCase() !== item.toLowerCase());
        }
        await user.save();

        // Add item to target user's inventory
        const targetItem = target.inventory.find(i => i.name.toLowerCase() === item.toLowerCase());
        if (targetItem) {
            targetItem.amount += amount;
        } else {
            target.inventory.push({ name: item, amount });
        }
        await target.save();

        await interaction.reply({ content: `Successfully traded ${amount} ${item}(s) with ${targetUser.username}.`, ephemeral: true });
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'Error during trade', ephemeral: true });
    }
}
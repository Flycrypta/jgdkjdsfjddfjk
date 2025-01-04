import { SlashCommandBuilder } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import { dbManager } from '../db/database.js';
import { createEmbed } from '../utils/embedStyles.js';
import { Database } from '../../database/database.js';
import { DatabaseError } from '../../db/errors/DatabaseError.js';

export const auctionCommands = {
    data: new SlashCommandBuilder()
        .setName('auction')
        .setDescription('Auction house commands')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('Create a new auction')
                .addIntegerOption(option =>
                    option.setName('item_id')
                        .setDescription('The ID of the item to auction')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('quantity')
                        .setDescription('Amount to auction')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('start_price')
                        .setDescription('Starting price in coins')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('buyout')
                        .setDescription('Buyout price (optional)')
                        .setRequired(false))
                .addIntegerOption(option =>
                    option.setName('duration')
                        .setDescription('Auction duration in hours')
                        .setRequired(true)
                        .addChoices(
                            { name: '6 hours', value: 6 },
                            { name: '12 hours', value: 12 },
                            { name: '24 hours', value: 24 },
                            { name: '48 hours', value: 48 }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('bid')
                .setDescription('Place a bid on an auction')
                .addIntegerOption(option =>
                    option.setName('auction_id')
                        .setDescription('The ID of the auction')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Bid amount in coins')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('buyout')
                .setDescription('Buyout an auction immediately')
                .addIntegerOption(option =>
                    option.setName('auction_id')
                        .setDescription('The ID of the auction')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List active auctions')
                .addIntegerOption(option =>
                    option.setName('page')
                        .setDescription('Page number')
                        .setRequired(false))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'create':
                    await handleCreateAuction(interaction);
                    break;
                case 'bid':
                    await handleBid(interaction);
                    break;
                case 'buyout':
                    await handleBuyout(interaction);
                    break;
                case 'list':
                    await handleListAuctions(interaction);
                    break;
            }
        } catch (error) {
            console.error('Auction command error:', error);
            await interaction.reply({
                content: 'An error occurred while processing the auction command.',
                ephemeral: true
            });
        }
    }
};

async function handleCreateAuction(interaction) {
    const itemId = interaction.options.getInteger('item_id');
    const quantity = interaction.options.getInteger('quantity');
    const startPrice = interaction.options.getInteger('start_price');
    const buyoutPrice = interaction.options.getInteger('buyout');
    const duration = interaction.options.getInteger('duration');

    try {
        // Check if user has the item
        const inventory = await dbManager.getInventory(interaction.user.id);
        const item = inventory.find(i => i.item_id === itemId && i.quantity >= quantity);

        if (!item) {
            return interaction.reply({
                content: 'You don\'t have enough of this item to auction.',
                ephemeral: true
            });
        }

        // Create the auction
        const auction = await dbManager.createAuction(
            interaction.user.id,
            itemId,
            quantity,
            startPrice,
            buyoutPrice,
            duration
        );

        const embed = createEmbed('auction', {
            title: 'Auction Created',
            description: `Your auction has been created with ID: ${auction.lastID}`
        });

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error creating auction:', error);
        await interaction.reply({
            content: 'Failed to create auction.',
            ephemeral: true
        });
    }
}

async function handleBid(interaction) {
    const auctionId = interaction.options.getInteger('auction_id');
    const bidAmount = interaction.options.getInteger('amount');

    try {
        // Check if user has enough coins
        const userCoins = await dbManager.getCoins(interaction.user.id);
        if (userCoins < bidAmount) {
            return interaction.reply({
                content: 'You don\'t have enough coins for this bid.',
                ephemeral: true
            });
        }

        await dbManager.placeBid(auctionId, interaction.user.id, bidAmount);

        const embed = createEmbed('auction', {
            title: 'Bid Placed',
            description: `Successfully placed a bid of ${bidAmount} coins on auction #${auctionId}`
        });

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error placing bid:', error);
        await interaction.reply({
            content: 'Failed to place bid.',
            ephemeral: true
        });
    }
}

async function handleBuyout(interaction) {
    const auctionId = interaction.options.getInteger('auction_id');

    try {
        await dbManager.buyoutAuction(auctionId, interaction.user.id);

        const embed = createEmbed('auction', {
            title: 'Auction Buyout',
            description: `Successfully bought out auction #${auctionId}`
        });

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error buying out auction:', error);
        await interaction.reply({
            content: 'Failed to buyout auction.',
            ephemeral: true
        });
    }
}

async function handleListAuctions(interaction) {
    const page = interaction.options.getInteger('page') || 1;
    const limit = 5;
    const offset = (page - 1) * limit;

    try {
        const auctions = await dbManager.getActiveAuctions(limit);
        
        if (auctions.length === 0) {
            return interaction.reply({
                content: 'No active auctions found.',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('Active Auctions')
            .setColor(0xFFA500)
            .setTimestamp();

        auctions.forEach(auction => {
            embed.addFields({
                name: `Auction #${auction.id} - ${auction.item_name}`,
                value: `Seller: ${auction.seller_name}\nQuantity: ${auction.quantity}\nCurrent Price: ${auction.current_price}\nBuyout: ${auction.buyout_price || 'N/A'}\nEnds: ${new Date(auction.end_time).toLocaleString()}`
            });
        });

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error listing auctions:', error);
        await interaction.reply({
            content: 'Failed to list auctions.',
            ephemeral: true
        });
    }
}

export default auctionCommands;

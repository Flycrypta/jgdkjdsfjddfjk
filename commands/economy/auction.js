import { SlashCommandBuilder } from 'discord.js';
import { Database } from '../../database/database.js';

export default {
    data: new SlashCommandBuilder()
        .setName('auction')
        .setDescription('Auction house system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List an item for auction')
                .addStringOption(option =>
                    option.setName('item')
                        .setDescription('Item to auction')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('price')
                        .setDescription('Starting price')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View current auctions')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        try {
            switch(subcommand) {
                case 'list':
                    // Handle listing item
                    const item = interaction.options.getString('item');
                    const price = interaction.options.getInteger('price');
                    await Database.createAuction(interaction.user.id, item, price);
                    await interaction.reply(`Listed ${item} for ${price} coins`);
                    break;

                case 'view':
                    // Handle viewing auctions
                    const auctions = await Database.getActiveAuctions();
                    const auctionList = auctions.map(a => 
                        `${a.itemName} - Current bid: ${a.currentBid} coins`
                    ).join('\n');
                    await interaction.reply(auctionList || 'No active auctions');
                    break;
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: 'There was an error processing your auction command.',
                ephemeral: true
            });
        }
    }
};

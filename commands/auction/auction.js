import { SlashCommandBuilder } from '@discordjs/builders';
import { dbManager } from '../../db/database.js';

export const data = new SlashCommandBuilder()
    .setName('auction')
    .setDescription('Auction commands')
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
    // ...existing auction subcommands...

export async function execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    try {
        switch(subcommand) {
            case 'list':
                // ...existing list handling...
                break;
            // ...other cases...
        }
    } catch (error) {
        await interaction.reply({ 
            content: 'Error processing auction command!', 
            ephemeral: true 
        });
    }
}

export default { data, execute };

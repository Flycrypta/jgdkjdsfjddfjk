import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('market')
    .setDescription('Access the metals market')
    .addSubcommand(sub => sub
        .setName('check')
        .setDescription('Check current market rates'))
    .addSubcommand(sub => sub
        .setName('sell')
        .setDescription('Sell gold or silver')
        .addStringOption(opt => 
            opt.setName('metal')
                .setDescription('Metal to sell')
                .addChoices(
                    { name: 'Gold', value: 'gold' },
                    { name: 'Silver', value: 'silver' }
                )
                .setRequired(true)));

export async function execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'check') {
        const embed = new EmbedBuilder()
            .setTitle('📊 Metals Market')
            .setDescription('Current market rates for precious metals')
            .addFields(
                { name: 'Gold', value: `${getCurrentPrice('gold')} coins/bar` },
                { name: 'Silver', value: `${getCurrentPrice('silver')} coins/bar` }
            )
            .setColor('#FFD700');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('refresh_market')
                    .setLabel('Refresh Rates')
                    .setStyle('Primary'),
                new ButtonBuilder()
                    .setCustomId('view_dealers')
                    .setLabel('View Dealers')
                    .setStyle('Secondary')
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    }
    // ... handle other subcommands
}

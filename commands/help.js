import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Display all available commands and their descriptions.');

export async function execute(interaction) {
    const embed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('Help Menu')
        .setDescription('Here are all the available commands:')
        .addFields(
            { name: '/register', value: 'Register into the ranking.' },
            { name: '/list', value: 'List all registered users.' },
            { name: '/help', value: 'Display all available commands and their descriptions.' },
            { name: '/viewtimers', value: 'View all active ticket deletion timers.' },
            // ... add other commands
        );

    const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('previous')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId('next')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary)
        );

    await interaction.reply({ embeds: [embed], components: [row] });
}

export default { data, execute };

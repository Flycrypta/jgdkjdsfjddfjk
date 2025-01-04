import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { Logger } from '../../utils/logger.js';

export const data = new SlashCommandBuilder()
    .setName('help')
    .setDescription('Shows all available commands')
    .addStringOption(option =>
        option.setName('category')
            .setDescription('Category of commands to show')
            .setRequired(false));

export async function execute(interaction) {
    const logger = new Logger(interaction.client);
    const { client } = interaction;
    const commandsByCategory = new Map();

    // Group commands by category
    client.commands.forEach(command => {
        const category = command.category || 'Uncategorized';
        if (!commandsByCategory.has(category)) {
            commandsByCategory.set(category, []);
        }
        commandsByCategory.get(category).push(command);
    });

    const category = interaction.options.getString('category');

    if (category) {
        // Show specific category
        const commands = commandsByCategory.get(category);
        if (!commands) {
            await logger.warn(`User ${interaction.user.username} requested an invalid category: ${category}.`);
            return interaction.reply({
                content: 'Invalid category specified.',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`${category} Commands`)
            .setDescription(commands.map(cmd => 
                `**/${cmd.data.name}** - ${cmd.data.description}`
            ).join('\n'));

        await logger.info(`User ${interaction.user.username} requested help for category: ${category}.`);
        return interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // Show all categories
    const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle('Command Categories')
        .setDescription('Use `/help category` to see commands in a specific category');

    for (const [category, commands] of commandsByCategory) {
        embed.addFields({
            name: category,
            value: commands.map(cmd => `\`${cmd.data.name}\``).join(', ')
        });
    }

    await logger.info(`User ${interaction.user.username} requested help for all categories.`);
    return interaction.reply({ embeds: [embed], ephemeral: true });
}
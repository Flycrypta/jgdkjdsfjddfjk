import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js';

export const helpCommand = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows all available commands'),

    async execute(interaction) {
        const commands = interaction.client.commands;
        const categories = new Map();
        commands.forEach(cmd => {
            const category = cmd.category || 'Uncategorized';
            if (!categories.has(category)) {
                categories.set(category, []);
            }
            categories.get(category).push(cmd);
        });

        const categoryNames = Array.from(categories.keys());
        let currentCategoryIndex = 0;

        const generateEmbed = (categoryIndex) => {
            const category = categoryNames[categoryIndex];
            const cmds = categories.get(category);
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle(`Bot Commands - ${category}`)
                .setDescription('Here are all available commands:')
                .setFooter({ text: `Page ${categoryIndex + 1} of ${categoryNames.length}` });

            const commandList = cmds.map(cmd => {
                const subcommands = cmd.data.options?.filter(opt => opt.type === 1);
                if (subcommands?.length) {
                    return `**/${cmd.data.name}**\n${subcommands.map(sub => 
                        `├ ${sub.name}: ${sub.description}`).join('\n')}`;
                }
                return `**/${cmd.data.name}**: ${cmd.data.description}`;
            }).join('\n\n');
            
            embed.addFields({ name: category, value: commandList });
            return embed;
        };

        const generateButtons = (categoryIndex) => {
            return new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('Previous')
                        .setStyle('Primary')
                        .setDisabled(categoryIndex === 0),
                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle('Primary')
                        .setDisabled(categoryIndex === categoryNames.length - 1)
                );
        };

        const embed = generateEmbed(currentCategoryIndex);
        const buttons = generateButtons(currentCategoryIndex);

        const message = await interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true });

        const collector = message.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'prev') {
                currentCategoryIndex = Math.max(currentCategoryIndex - 1, 0);
            } else if (i.customId === 'next') {
                currentCategoryIndex = Math.min(currentCategoryIndex + 1, categoryNames.length - 1);
            }

            const newEmbed = generateEmbed(currentCategoryIndex);
            const newButtons = generateButtons(currentCategoryIndex);

            await i.update({ embeds: [newEmbed], components: [newButtons] });
        });

        collector.on('end', async () => {
            await message.edit({ components: [] });
        });
    }
};

export default helpCommand;

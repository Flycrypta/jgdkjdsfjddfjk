import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { recipes } from '../../../../data/recipes.js';
import { prisma } from '../../../../database/prisma';
import BaseCommand from '../../BaseCommand';

export default class CraftingCommand extends BaseCommand {
    constructor() {
        super();
        this.data = new SlashCommandBuilder()
            .setName('crafting')
            .setDescription('Crafting system commands')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('craft')
                    .setDescription('Craft an item')
                    .addStringOption(option =>
                        option.setName('item')
                            .setDescription('Item to craft')
                            .setRequired(true))
                    .addIntegerOption(option =>
                        option.setName('quantity')
                            .setDescription('Quantity to craft')
                            .setMinValue(1)
                            .setMaxValue(100)
                            .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('recipes')
                    .setDescription('View available crafting recipes'));
        this.category = 'Economy';
        this.permissions = [];
    }

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'craft') {
            await this.handleCrafting(interaction);
        } else if (subcommand === 'recipes') {
            await this.showRecipes(interaction);
        }
    }

    async handleCrafting(interaction) {
        try {
            const itemName = interaction.options.getString('item');
            const quantity = interaction.options.getInteger('quantity');
            const recipe = recipes[itemName];

            if (!recipe) {
                return await interaction.reply({ content: 'Invalid recipe!', ephemeral: true });
            }

            const userData = await prisma.user.findUnique({
                where: { userId: interaction.user.id },
                include: { inventory: true }
            });

            if (!userData) {
                return await interaction.reply({ 
                    content: 'You need to create a profile first!', 
                    ephemeral: true 
                });
            }

            // Check if user has required materials
            const userInventory = userData.inventory;
            for (const [material, amount] of Object.entries(recipe.materials)) {
                const userHas = userInventory.find(item => item.itemId === material)?.quantity || 0;
                if (userHas < amount * quantity) {
                    return await interaction.reply({
                        content: `You don't have enough ${material}! Need: ${amount * quantity}, Have: ${userHas}`,
                        ephemeral: true
                    });
                }
            }

            // Remove materials and add crafted item
            for (const [material, amount] of Object.entries(recipe.materials)) {
                await prisma.inventory.update({
                    where: {
                        userId_itemId: {
                            userId: interaction.user.id,
                            itemId: material
                        }
                    },
                    data: {
                        quantity: {
                            decrement: amount * quantity
                        }
                    }
                });
            }

            // Add crafted item to inventory
            await prisma.inventory.upsert({
                where: {
                    userId_itemId: {
                        userId: interaction.user.id,
                        itemId: itemName
                    }
                },
                update: {
                    quantity: {
                        increment: recipe.output * quantity
                    }
                },
                create: {
                    userId: interaction.user.id,
                    itemId: itemName,
                    quantity: recipe.output * quantity
                }
            });

            await interaction.reply({
                content: `Successfully crafted ${quantity}x ${recipe.name}!`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Error in crafting:', error);
            await interaction.reply({
                content: 'An error occurred while crafting.',
                ephemeral: true
            });
        }
    }

    async showRecipes(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('Available Crafting Recipes')
            .setColor('#0099ff');

        for (const [id, recipe] of Object.entries(recipes)) {
            const materials = Object.entries(recipe.materials)
                .map(([item, amount]) => `${amount}x ${item}`)
                .join(', ');

            embed.addFields({
                name: recipe.name,
                value: `Materials needed: ${materials}\nOutput: ${recipe.output}x ${recipe.name}`
            });
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}
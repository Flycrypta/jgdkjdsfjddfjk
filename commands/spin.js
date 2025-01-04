import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';
import { dbManager } from '../db/database.js';
import { WHEEL_TYPES as wheels } from '../utils/index.js'; // Importing wheel arrays from index.js

export const data = new SlashCommandBuilder()
    .setName('spin')
    .setDescription('Spin different wheels for rewards')
    .addStringOption(option =>
        option.setName('wheel')
            .setDescription('Which wheel to spin')
            .setRequired(true)
            .addChoices(
                { name: '🥉 Bronze Wheel (100 coins)', value: 'bronze' },
                { name: '⚪ Silver Wheel (250 coins)', value: 'silver' },
                { name: '🟡 Gold Wheel (500 coins)', value: 'gold' },
                { name: '⬜ Platinum Wheel (1000 coins)', value: 'platinum' },
                { name: '💎 Diamond Wheel (2000 coins)', value: 'diamond' },
                { name: '💚 Emerald Wheel (3000 coins)', value: 'emerald' },
                { name: '❤️ Ruby Wheel (4000 coins)', value: 'ruby' },
                { name: '💙 Sapphire Wheel (5000 coins)', value: 'sapphire' },
                { name: '⚫ Obsidian Wheel (7500 coins)', value: 'obsidian' },
                { name: '👑 VIP Wheel (10000 coins)', value: 'vip' }
            ));

export async function execute(interaction) {
    const wheelType = interaction.options.getString('wheel');
    const wheel = wheels[wheelType];

    // Check VIP status for VIP wheel
    if (wheel.requiresRole && !interaction.member.roles.cache.some(role => role.name === wheel.requiresRole)) {
        return interaction.reply({
            content: `You need the ${wheel.requiresRole} role to use this wheel!`,
            ephemeral: true
        });
    }

    // Check if user has enough coins
    const coins = await dbManager.getCoins(interaction.user.id);
    if (coins < wheel.cost) {
        return interaction.reply({
            content: `You need ${wheel.cost} coins to spin this wheel. You have ${coins} coins.`,
            ephemeral: true
        });
    }

    try {
        // Deduct coins
        await dbManager.updateCoins(interaction.user.id, -wheel.cost);
        
        // Generate and apply reward
        const reward = generateReward(wheel.rewards);
        await dbManager.recordWheelSpin(interaction.user.id, wheel.id, reward.id);
        await dbManager.addItemToInventory(interaction.user.id, reward.id, reward.quantity);

        // Create fancy embed
        const embed = new EmbedBuilder()
            .setTitle(`🎰 ${wheelType.toUpperCase()} WHEEL SPIN 🎰`)
            .setDescription(`You spent ${wheel.cost} coins`)
            .setColor(wheel.color)
            .addFields(
                { name: 'Reward', value: `${reward.name} x${reward.quantity}`, inline: true },
                { name: 'Rarity', value: reward.rarity, inline: true }
            )
            .setFooter({ text: 'Good luck on your next spin!' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        console.error('Error in spin command:', error);
        await interaction.reply({
            content: 'An error occurred while spinning the wheel.',
            ephemeral: true
        });
    }
}

function generateReward(rewards) {
    const totalWeight = rewards.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;

    for (const item of rewards) {
        random -= item.weight;
        if (random <= 0) return item;
    }

    return rewards[0];
}

export default { data, execute };

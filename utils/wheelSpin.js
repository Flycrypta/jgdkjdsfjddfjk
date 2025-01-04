import { dbManager } from '../db/database.js';

/**
 * Performs a wheel spin for a user and returns the reward.
 * @param {string} userId - The ID of the user spinning the wheel.
 * @param {string} wheelType - The type of wheel being spun.
 * @returns {object} - The reward obtained from spinning.
 */
export async function performWheelSpin(userId, wheelType) {
    // Define wheel configurations
    const wheelConfigs = {
        bronze: {
            cost: 100,
            rewards: [
                { name: 'Common Box', quantity: 1, rarity: 'Common', weight: 70 },
                { name: 'Small Potion', quantity: 2, rarity: 'Common', weight: 25 },
                { name: 'Basic Card', quantity: 1, rarity: 'Uncommon', weight: 5 }
            ]
        },
        silver: {
            cost: 250,
            rewards: [
                { name: 'Silver Box', quantity: 1, rarity: 'Uncommon', weight: 60 },
                { name: 'Medium Potion', quantity: 3, rarity: 'Common', weight: 30 },
                { name: 'Silver Card', quantity: 2, rarity: 'Rare', weight: 10 }
            ]
        },
        gold: {
            cost: 500,
            rewards: [
                { name: 'Gold Box', quantity: 1, rarity: 'Rare', weight: 50 },
                { name: 'Large Potion', quantity: 5, rarity: 'Uncommon', weight: 30 },
                { name: 'Gold Card', quantity: 3, rarity: 'Epic', weight: 20 }
            ]
        },
        platinum: {
            cost: 1000,
            rewards: [
                { name: 'Platinum Box', quantity: 1, rarity: 'Epic', weight: 40 },
                { name: 'Ultra Potion', quantity: 10, rarity: 'Rare', weight: 35 },
                { name: 'Platinum Card', quantity: 5, rarity: 'Legendary', weight: 25 }
            ]
        },
        diamond: {
            cost: 2000,
            rewards: [
                { name: 'Diamond Box', quantity: 1, rarity: 'Legendary', weight: 30 },
                { name: 'Mega Potion', quantity: 20, rarity: 'Epic', weight: 40 },
                { name: 'Diamond Card', quantity: 10, rarity: 'Mythic', weight: 30 }
            ]
        },
        emerald: {
            cost: 3000,
            rewards: [
                { name: 'Emerald Box', quantity: 1, rarity: 'Mythic', weight: 25 },
                { name: 'Hyper Potion', quantity: 30, rarity: 'Legendary', weight: 50 },
                { name: 'Emerald Card', quantity: 15, rarity: 'Divine', weight: 25 }
            ]
        },
        ruby: {
            cost: 4000,
            rewards: [
                { name: 'Ruby Box', quantity: 1, rarity: 'Divine', weight: 20 },
                { name: 'Super Potion', quantity: 40, rarity: 'Mythic', weight: 50 },
                { name: 'Ruby Card', quantity: 20, rarity: 'Ultimate', weight: 30 }
            ]
        },
        sapphire: {
            cost: 5000,
            rewards: [
                { name: 'Sapphire Box', quantity: 1, rarity: 'Ultimate', weight: 15 },
                { name: 'Ultra Potion', quantity: 50, rarity: 'Divine', weight: 50 },
                { name: 'Sapphire Card', quantity: 25, rarity: 'Exalted', weight: 35 }
            ]
        },
        obsidian: {
            cost: 7500,
            rewards: [
                { name: 'Obsidian Box', quantity: 1, rarity: 'Exalted', weight: 10 },
                { name: 'Infinity Potion', quantity: 75, rarity: 'Ultimate', weight: 50 },
                { name: 'Obsidian Card', quantity: 30, rarity: 'Ascended', weight: 40 }
            ]
        },
        vip: {
            cost: 10000,
            rewards: [
                { name: '🌟 VIP Box', quantity: 1, rarity: 'Legendary', weight: 40 },
                { name: '👑 Crown', quantity: 1, rarity: 'Mythic', weight: 30 },
                { name: '💫 Star Essence', quantity: 2, rarity: 'Divine', weight: 20 },
                { name: '🌈 Rainbow Crystal', quantity: 1, rarity: 'Ultimate', weight: 10 }
            ]
        }
    };

    const wheel = wheelConfigs[wheelType];
    if (!wheel) {
        throw new Error('Invalid wheel type.');
    }

    // Get user coins
    const userCoins = await dbManager.getCoins(userId);
    if (userCoins < wheel.cost) {
        throw new Error('Insufficient coins.');
    }

    // Deduct coins
    await dbManager.updateCoins(userId, -wheel.cost);

    // Generate and apply reward
    const reward = generateReward(wheel.rewards);
    await dbManager.recordWheelSpin(userId, wheel.id, reward.id);
    await dbManager.addItemToInventory(userId, reward.id, reward.quantity);

    return reward;
}

/**
 * Selects a random reward based on weight.
 * @param {Array} rewards - Array of reward objects with weight properties.
 * @returns {object} - Selected reward.
 */
function generateReward(rewards) {
    const totalWeight = rewards.reduce((sum, reward) => sum + reward.weight, 0);
    let random = Math.random() * totalWeight;
    for (const reward of rewards) {
        random -= reward.weight;
        if (random <= 0) {
            return reward;
        }
    }
    return rewards[0];
}

export async function handleWheelSpin(interaction, wheelType, dbManager) {
    const wheel = WHEELS[wheelType];
    
    if (!wheel) return interaction.reply('Invalid wheel type!');

    if (wheel.requiresRole) {
        const hasRole = interaction.member.roles.cache
            .some(role => role.name.toLowerCase() === wheel.requiresRole.toLowerCase());
        if (!hasRole) {
            return interaction.reply({
                content: `You need the ${wheel.requiresRole} role to use this wheel!`,
                ephemeral: true
            });
        }
    }

    const userCoins = await dbManager.getCoins(interaction.user.id);
    if (userCoins < wheel.cost) {
        return interaction.reply({
            content: `You need ${wheel.cost} coins to spin this wheel. You have ${userCoins} coins.`,
            ephemeral: true
        });
    }

    await dbManager.updateCoins(interaction.user.id, -wheel.cost);

    // Generate random result
    const slices = wheel.slices;
    const result = slices[Math.floor(Math.random() * slices.length)];
    
    // Create initial embed
    const spinEmbed = {
        color: 0x0099ff,
        title: `🎡 ${wheel.name} Wheel Spin`,
        description: '**Spinning...**\n↙️⬇️↘️',
        fields: [
            { name: 'Cost', value: `${wheel.cost} coins`, inline: true },
            { name: 'Current Balance', value: `${userCoins - wheel.cost} coins`, inline: true }
        ]
    };

    const reply = await interaction.reply({ embeds: [spinEmbed], fetchReply: true });

    // Spinning animation
    const arrows = ['↙️⬇️↘️', '⬅️❌➡️', '↖️⬆️↗️'];
    for (let i = 0; i < 3; i++) {
        spinEmbed.description = `**Spinning...**\n${arrows[i]}`;
        await reply.edit({ embeds: [spinEmbed] });
        await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Show result
    spinEmbed.description = `🎉 You got: **${result.name}**!\n${result.description || ''}`;
    spinEmbed.color = result.color || 0x0099ff;

    // Apply rewards
    if (result.coins) {
        await dbManager.updateCoins(interaction.user.id, result.coins);
        spinEmbed.fields.push({
            name: 'Coins Won',
            value: `${result.coins > 0 ? '+' : ''}${result.coins}`,
            inline: true
        });
    }

    if (result.items) {
        const itemRewards = [];
        for (const item of result.items) {
            await dbManager.addInventoryItem(interaction.user.id, item.id, item.quantity || 1);
            itemRewards.push(`${item.quantity || 1}x ${item.name}`);
        }
        
        if (itemRewards.length > 0) {
            spinEmbed.fields.push({
                name: '🎁 Items Won',
                value: itemRewards.join('\n'),
                inline: true
            });
        }
    }

    if (result.role) {
        const role = interaction.guild.roles.cache.find(r => r.name === result.role);
        if (role) {
            await interaction.member.roles.add(role);
            spinEmbed.fields.push({
                name: 'Role Reward',
                value: role.name,
                inline: true
            });
        }
    }

    // Add help footer to all embeds
    spinEmbed.footer = {
        text: 'Need help? Use /help or create a ticket with /maketicket'
    };

    await reply.edit({ embeds: [spinEmbed] });
}

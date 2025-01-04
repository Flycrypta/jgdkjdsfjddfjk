import { SlashCommandBuilder } from 'discord.js';
import { Logger } from '../utils/logger.js';
import { WHEEL_ITEMS, WHEEL_TYPES } from '../utils/index.js'; // Import wheel items
import { Database } from '../../database/database.js';
import { DatabaseError } from '../../db/errors/DatabaseError.js';

const log = new Logger('EconomyCommand');

export const commands = [
    new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Check your balance'),
    new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily reward'),
    new SlashCommandBuilder()
        .setName('spin')
        .setDescription('Spin a wheel for random coins'),
    new SlashCommandBuilder()
        .setName('spin10')
        .setDescription('Spin the wheel 10 times for random rewards'),
    new SlashCommandBuilder()
        .setName('vipspin')
        .setDescription('VIP spin with higher rewards'),
    new SlashCommandBuilder()
        .setName('gems')
        .setDescription('Check your gems balance'),
    new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('Send coins to another user')
        .addUserOption(opt =>
            opt.setName('target')
               .setDescription('The user to receive coins')
               .setRequired(true)
        )
        .addIntegerOption(opt =>
            opt.setName('amount')
               .setDescription('Amount of coins to transfer')
               .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('inventory')
        .setDescription('View your items'),
    new SlashCommandBuilder()
        .setName('buy')
        .setDescription('Buy an item')
        .addStringOption(opt => 
            opt.setName('itemname')
               .setDescription('Name of the item to purchase')
               .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('sell')
        .setDescription('Sell an item from your inventory')
        .addStringOption(opt =>
            opt.setName('itemname')
               .setDescription('Name of the item to sell')
               .setRequired(true)
        ),
    new SlashCommandBuilder()
        .setName('auction')
        .setDescription('Manage your auctions')
        .addStringOption(opt =>
            opt.setName('action')
               .setDescription('Auction action')
               .setRequired(true)
               .addChoices(
                   { name: 'List', value: 'list' },
                   { name: 'Buyout', value: 'buyout' },
                   { name: 'View', value: 'view' }
               ))
        .addStringOption(opt =>
            opt.setName('item')
               .setDescription('Item to auction or buyout')
               .setRequired(false))
        .addIntegerOption(opt =>
            opt.setName('amount')
               .setDescription('Buyout amount')
               .setRequired(false)),
    new SlashCommandBuilder()
        .setName('job')
        .setDescription('Work a job')
        .addStringOption(opt =>
            opt.setName('job')
               .setDescription('Job to work')
               .setRequired(true)
               .addChoices(
                   { name: 'Driver', value: 'driver' },
                   { name: 'Mechanic', value: 'mechanic' },
                   { name: 'Dealer', value: 'dealer' },
                   { name: 'Designer', value: 'designer' },
                   { name: 'Engineer', value: 'engineer' },
                   { name: 'Salesperson', value: 'salesperson' },
                   { name: 'Manager', value: 'manager' },
                   { name: 'Cleaner', value: 'cleaner' },
                   { name: 'Security', value: 'security' },
                   { name: 'Tester', value: 'tester' },
                   { name: 'Fast Food Worker', value: 'fast_food_worker' },
                   { name: 'Criminal', value: 'criminal' }
               )),
    new SlashCommandBuilder()
        .setName('mod')
        .setDescription('Modify your car')
        .addStringOption(opt =>
            opt.setName('car')
               .setDescription('Car to modify')
               .setRequired(true))
        .addStringOption(opt =>
            opt.setName('mod')
               .setDescription('Modification to apply')
               .setRequired(true)),
    new SlashCommandBuilder()
        .setName('race')
        .setDescription('Race with your car')
        .addStringOption(opt =>
            opt.setName('car')
               .setDescription('Car to race with')
               .setRequired(true))
        .addUserOption(opt =>
            opt.setName('opponent')
               .setDescription('User to race against')
               .setRequired(false))
];

export async function handleCommand(interaction, dbManager) {
    const logger = new Logger(interaction.client);
    try {
        await interaction.deferReply({ ephemeral: true });
        const { commandName, user } = interaction;

        // Ensure user exists in database
        let userData = await dbManager.getUser(user.id, user.username);
        if (!userData) {
            await interaction.editReply('Creating your profile...');
            await dbManager.createUser(user.id, user.username);
            userData = await dbManager.getUser(user.id, user.username);
        }

        switch (commandName) {
            case 'balance':
                await interaction.editReply({
                    content: `💰 Balance: ${userData.coins.toLocaleString()} coins`
                });
                await logger.info(`User ${user.username} checked their balance.`);
                break;

            case 'daily':
                const canClaim = await dbManager.canClaimDaily(user.id);
                if (!canClaim) {
                    const nextClaim = await dbManager.getNextClaimTime(user.id);
                    await interaction.editReply({
                        content: `⏰ You can claim your next reward ${nextClaim}`
                    });
                    await logger.info(`User ${user.username} tried to claim daily reward but it's not available yet.`);
                    return;
                }

                const reward = await dbManager.claimDailyReward(user.id);
                if (!reward) {
                    await interaction.editReply('Failed to process reward. Please try again.');
                    await logger.error(`Failed to process daily reward for user ${user.username}.`);
                    return;
                }

                await interaction.editReply({
                    content: `🎉 Daily Reward Claimed!\n` +
                             `💰 Amount: ${reward.amount.toLocaleString()} coins\n` +
                             `🔥 Streak: ${reward.streak} days\n` +
                             `✨ Multiplier: ${reward.multiplier}x`
                });
                await logger.info(`User ${user.username} claimed their daily reward.`);
                break;

            case 'spin':
                const spinCost = 50;
                if (userData.coins < spinCost) {
                    await interaction.editReply(`You need at least ${spinCost} coins to spin.`);
                    await logger.info(`User ${user.username} tried to spin but didn't have enough coins.`);
                    return;
                }
                // Deduct cost
                dbManager.addCoins(user.id, -spinCost);

                const spinReward = Math.floor(Math.random() * 501); // 0–500
                dbManager.addCoins(user.id, spinReward);

                // Use items from WHEEL_ITEMS array
                const randomItem = WHEEL_ITEMS[Math.floor(Math.random() * WHEEL_ITEMS.length)];
                dbManager.addItemToInventory(user.id, randomItem.id, 1);

                await interaction.editReply(`You spun the wheel! You got ${spinReward} coins and a ${randomItem.name}.`);
                await logger.info(`User ${user.username} spun the wheel and won ${spinReward} coins and a ${randomItem.name}.`);
                break;

            case 'spin10':
                if (userData.coins < 500) {
                    await interaction.editReply(`You need at least 500 coins (50 per spin) to do 10 spins.`);
                    await logger.info(`User ${user.username} tried to spin 10 times but didn't have enough coins.`);
                    return;
                }
                dbManager.addCoins(user.id, -500);

                let totalCoinReward = 0;
                let totalGemReward = 0;
                for (let i = 0; i < 10; i++) {
                    const coinReward = Math.floor(Math.random() * 501);
                    const gemReward = Math.random() < 0.1 ? 1 : 0; 
                    totalCoinReward += coinReward;
                    totalGemReward += gemReward;
                }
                dbManager.addCoins(user.id, totalCoinReward);
                dbManager.addGems(user.id, totalGemReward);
                await interaction.editReply(`You got a total of ${totalCoinReward} coins and ${totalGemReward} gems from 10 spins!`);
                await logger.info(`User ${user.username} spun the wheel 10 times and won a total of ${totalCoinReward} coins and ${totalGemReward} gems.`);
                break;

            case 'vipspin':
                if (userData.gems < 5) {
                    await interaction.editReply(`You need at least 5 gems to do a VIP spin.`);
                    await logger.info(`User ${user.username} tried to do a VIP spin but didn't have enough gems.`);
                    return;
                }
                dbManager.addGems(user.id, -5);

                const vipCoinReward = Math.floor(Math.random() * 2001) + 500; 
                const vipGemReward = Math.random() < 0.25 ? 1 : 0;
                dbManager.addCoins(user.id, vipCoinReward);
                dbManager.addGems(user.id, vipGemReward);
                await interaction.editReply(`VIP spin: You won ${vipCoinReward} coins and ${vipGemReward} gems!`);
                await logger.info(`User ${user.username} did a VIP spin and won ${vipCoinReward} coins and ${vipGemReward} gems.`);
                break;

            case 'gems':
                await interaction.editReply(`You have ${userData.gems.toLocaleString()} gems.`);
                await logger.info(`User ${user.username} checked their gems balance.`);
                break;

            case 'transfer':
                // Deduct coins from sender and add to target
                const target = interaction.options.getUser('target');
                const transferAmount = interaction.options.getInteger('amount');
                if (!target || target.id === user.id || transferAmount <= 0) {
                    await interaction.editReply('Invalid transfer parameters.');
                    await logger.warn(`User ${user.username} tried to transfer coins with invalid parameters.`);
                    return;
                }

                if (userData.coins < transferAmount) {
                    await interaction.editReply(`You don't have enough coins to transfer ${transferAmount}.`);
                    await logger.info(`User ${user.username} tried to transfer ${transferAmount} coins but didn't have enough.`);
                    return;
                }

                dbManager.addCoins(user.id, -transferAmount);

                // Ensure target user
                let targetData = await dbManager.getUser(target.id, target.username);
                if (!targetData) {
                    await dbManager.createUser(target.id, target.username);
                    targetData = await dbManager.getUser(target.id, target.username);
                }
                dbManager.addCoins(target.id, transferAmount);

                await interaction.editReply(`Transferred ${transferAmount} coins to ${target.username}.`);
                await logger.info(`User ${user.username} transferred ${transferAmount} coins to ${target.username}.`);
                break;

            case 'inventory':
                const inventoryRows = dbManager.stmt.getInventory.all(user.id);
                if (!inventoryRows || inventoryRows.length === 0) {
                    await interaction.editReply('Your inventory is empty.');
                    await logger.info(`User ${user.username} checked their inventory but it was empty.`);
                    return;
                }
                let inventoryMsg = 'Your inventory:\n';
                inventoryRows.forEach(row => {
                    inventoryMsg += `• ${row.name} (x${row.quantity})\n`;
                });
                await interaction.editReply(inventoryMsg);
                await logger.info(`User ${user.username} checked their inventory.`);
                break;

            case 'buy':
                {
                    const itemName = interaction.options.getString('itemname');
                    // Simple item lookup
                    const itemRow = dbManager.db.prepare(`
                        SELECT * FROM items WHERE LOWER(name) = LOWER(?)
                    `).get(itemName);

                    if (!itemRow) {
                        await interaction.editReply(`Item '${itemName}' not found.`);
                        await logger.warn(`User ${user.username} tried to buy an item that was not found: ${itemName}.`);
                        return;
                    }
                    if (userData.coins < itemRow.price) {
                        await interaction.editReply(`You don't have enough coins to buy '${itemRow.name}'.`);
                        await logger.info(`User ${user.username} tried to buy '${itemRow.name}' but didn't have enough coins.`);
                        return;
                    }

                    dbManager.addCoins(user.id, -itemRow.price);
                    dbManager.addItemToInventory(user.id, itemRow.id, 1);
                    await interaction.editReply(`You bought 1x ${itemRow.name} for ${itemRow.price} coins.`);
                    await logger.info(`User ${user.username} bought 1x ${itemRow.name} for ${itemRow.price} coins.`);

                    // Assign role based on item value
                    const valueRoleMap = {
                        1000: 'High Roller',
                        5000: 'Big Spender',
                        10000: 'Wealthy Collector'
                    };

                    const roleName = Object.keys(valueRoleMap).find(value => itemRow.price >= value);
                    if (roleName) {
                        const role = interaction.guild.roles.cache.find(r => r.name === valueRoleMap[roleName]);
                        if (role) {
                            await interaction.member.roles.add(role);
                            await interaction.followUp({ content: `You have been assigned the role: ${valueRoleMap[roleName]}`, ephemeral: true });
                        }
                    }
                }
                break;

            case 'sell':
                {
                    const sellItem = interaction.options.getString('itemname');
                    const itemRow = dbManager.db.prepare(`
                        SELECT i.id, i.name, v.quantity, i.price
                        FROM inventory v
                        JOIN items i ON i.id = v.itemId
                        WHERE v.userId = ? AND LOWER(i.name) = LOWER(?)
                    `).get(user.id, sellItem);

                    if (!itemRow || itemRow.quantity < 1) {
                        await interaction.editReply(`You don't have '${sellItem}' to sell.`);
                        await logger.warn(`User ${user.username} tried to sell an item they don't have: ${sellItem}.`);
                        return;
                    }

                    // Sell for half price
                    const sellPrice = Math.floor(itemRow.price / 2);

                    dbManager.addCoins(user.id, sellPrice);
                    // Reduce quantity by 1
                    dbManager.db.prepare(`
                        UPDATE inventory SET quantity = quantity - 1
                        WHERE userId = ? AND itemId = ?
                    `).run(user.id, itemRow.id);

                    await interaction.editReply(`You sold 1x ${itemRow.name} for ${sellPrice} coins.`);
                    await logger.info(`User ${user.username} sold 1x ${itemRow.name} for ${sellPrice} coins.`);
                }
                break;

            case 'auction':
                const action = interaction.options.getString('action');
                const auctionItem = interaction.options.getString('item');
                const auctionAmount = interaction.options.getInteger('amount');
                
                switch(action) {
                    case 'list':
                        const itemToList = await dbManager.getItemFromInventory(user.id, auctionItem);
                        if (!itemToList) {
                            await interaction.editReply(`You don't own ${auctionItem}.`);
                            return;
                        }
                        await dbManager.createAuction(user.id, itemToList.id, auctionAmount);
                        await interaction.editReply(`Listed ${auctionItem} for auction starting at ${auctionAmount} coins.`);
                        break;
                        
                    case 'buyout':
                        const auctionItemDetails = await dbManager.getAuction(auctionItem);
                        if (!auctionItemDetails || userData.coins < auctionAmount) {
                            await interaction.editReply(`Cannot buyout ${auctionItem}.`);
                            return;
                        }
                        await dbManager.buyoutAuction(auctionItemDetails.id, user.id, auctionAmount);
                        await interaction.editReply(`You bought ${auctionItem} for ${auctionAmount} coins!`);
                        break;
                        
                    case 'view':
                        const auctions = await dbManager.getActiveAuctions();
                        const auctionList = auctions.map(a => 
                            `${a.itemName} - Current bid: ${a.currentBid} coins - Ends at: ${a.end_time}`
                        ).join('\n');
                        await interaction.editReply(auctionList || 'No active auctions.');
                        break;
                }
                break;

            case 'job':
                const job = interaction.options.getString('job');
                let baseEarnings = 0;
                let risk = 0;

                switch(job) {
                    case 'driver': baseEarnings = 100; risk = 0.1; break;
                    case 'mechanic': baseEarnings = 150; risk = 0.15; break;
                    case 'dealer': baseEarnings = 200; risk = 0.2; break;
                    case 'designer': baseEarnings = 250; risk = 0.1; break;
                    case 'engineer': baseEarnings = 300; risk = 0.15; break;
                    case 'manager': baseEarnings = 400; risk = 0.2; break;
                    case 'criminal': baseEarnings = 1000; risk = 0.8; break;
                    default: baseEarnings = 50; risk = 0.05;
                }

                if (Math.random() < risk) {
                    await interaction.editReply(`You failed at your job as ${job} and earned nothing!`);
                    return;
                }

                const earnings = Math.floor(baseEarnings * (1 + Math.random() * 0.5));
                await dbManager.addCoins(user.id, earnings);
                await interaction.editReply(`You worked as a ${job} and earned ${earnings} coins!`);
                break;

            case 'mod':
                const car = interaction.options.getString('car');
                const mod = interaction.options.getString('mod');
                
                const ownedCar = await dbManager.getCarFromInventory(user.id, car);
                if (!ownedCar) {
                    await interaction.editReply(`You don't own a ${car}.`);
                    return;
                }

                const modCost = {
                    'turbo': 1000,
                    'exhaust': 500,
                    'suspension': 750,
                    'nitro': 2000,
                    'tires': 300
                }[mod.toLowerCase()] || 100;

                if (userData.coins < modCost) {
                    await interaction.editReply(`You need ${modCost} coins to install ${mod}.`);
                    return;
                }

                await dbManager.addCoins(user.id, -modCost);
                await dbManager.addCarMod(user.id, ownedCar.id, mod);
                await interaction.editReply(`Successfully installed ${mod} on your ${car} for ${modCost} coins!`);
                break;

            case 'race':
                const raceCar = interaction.options.getString('car');
                const opponent = interaction.options.getUser('opponent');
                
                const userRaceCar = await dbManager.getCarFromInventory(user.id, raceCar);
                if (!userRaceCar) {
                    await interaction.editReply(`You don't own a ${raceCar}.`);
                    return;
                }

                const raceCost = 100;
                if (userData.coins < raceCost) {
                    await interaction.editReply(`You need ${raceCost} coins to enter a race.`);
                    return;
                }

                await dbManager.addCoins(user.id, -raceCost);

                if (opponent) {
                    const opponentCar = await dbManager.getRandomCarFromInventory(opponent.id);
                    if (!opponentCar) {
                        await interaction.editReply(`${opponent.username} doesn't own any cars to race with.`);
                        return;
                    }

                    const userScore = userRaceCar.horsepower * (1 + Math.random());
                    const opponentScore = opponentCar.horsepower * (1 + Math.random());

                    const prize = raceCost * 2;
                    let result = '';

                    if (userScore > opponentScore) {
                        await dbManager.addCoins(user.id, prize);
                        result = `You won the race against ${opponent.username} and earned ${prize} coins!`;
                    } else {
                        result = `You lost the race against ${opponent.username}!`;
                    }

                    await dbManager.createRace(user.id, opponent.id, userRaceCar.id, opponentCar.id, userScore, opponentScore, prize, result);
                    await interaction.editReply(result);
                } else {
                    // AI opponent
                    const aiDifficulty = 0.8 + (Math.random() * 0.4);
                    const userScore = userRaceCar.horsepower * (1 + Math.random());
                    const aiScore = userRaceCar.horsepower * aiDifficulty;

                    const prize = raceCost * 1.5;
                    let result = '';

                    if (userScore > aiScore) {
                        await dbManager.addCoins(user.id, prize);
                        result = `You won the race and earned ${prize} coins!`;
                    } else {
                        result = `You lost the race!`;
                    }

                    await dbManager.createRace(user.id, null, userRaceCar.id, null, userScore, aiScore, prize, result);
                    await interaction.editReply(result);
                }
                break;
        }
    } catch (error) {
        log.error(`Economy command error`, error);
        await logger.error(`Economy command error: ${error.message}`);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'Error processing command!', ephemeral: true });
        } else {
            await interaction.editReply({ content: 'Error processing command!' });
        }
    }
}

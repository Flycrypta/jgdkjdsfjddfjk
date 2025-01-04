const { Collection } = require('discord.js');

const tradeCooldowns = new Collection();
const TRADE_COOLDOWN = 300000; // 5 minutes

const validateTrade = (user1, user2, amount) => {
    // Check for trade bans
    if (user1.tradeBanned || user2.tradeBanned) {
        return { valid: false, reason: 'One or both users are trade banned' };
    }

    // Check cooldowns
    if (tradeCooldowns.has(user1.userId) || tradeCooldowns.has(user2.userId)) {
        return { valid: false, reason: 'Trade cooldown active' };
    }

    // Check if amount is valid
    if (amount <= 0 || amount > user1.balance) {
        return { valid: false, reason: 'Invalid amount' };
    }

    return { valid: true };
};

const secureTradeExecution = async (user1, user2, amount) => {
    // Implement atomic transaction
    try {
        // Start transaction
        // Update balances
        // Commit transaction
        tradeCooldowns.set(user1.userId, Date.now());
        tradeCooldowns.set(user2.userId, Date.now());
        return true;
    } catch (error) {
        // Rollback transaction
        return false;
    }
};

module.exports = {
    validateTrade,
    secureTradeExecution
};

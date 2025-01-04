const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { addCoins, getUser, updateUser, getEventMultiplier, getRandomBonusItem } = require('../../utils/economy');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily reward'),
        
    async execute(interaction) {
        const userId = interaction.user.id;
        const user = await getUser(userId);
        const now = Date.now();
        const dailyAmount = 100;
        const vipMultiplier = user.isVIP ? 1.5 : 1;
        const eventMultiplier = await getEventMultiplier('daily');
        const streakProtectionWindow = 2 * 60 * 60 * 1000; // 2 hours
        const streakBonus = user.streak * 10;
        const reward = dailyAmount + streakBonus;
        const totalReward = reward * vipMultiplier * eventMultiplier;
        const bonusItem = getRandomBonusItem();

        if (user.lastDaily && now - user.lastDaily < 24 * 60 * 60 * 1000 - streakProtectionWindow) {
            const timeLeft = 24 * 60 * 60 * 1000 - (now - user.lastDaily);
            const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
            
            return interaction.reply({
                content: `You can claim your next daily reward in ${hoursLeft}h ${minutesLeft}m`,
                ephemeral: true
            });
        }

        if (user.lastDaily && now - user.lastDaily >= 24 * 60 * 60 * 1000 + streakProtectionWindow) {
            user.streak = 0; // Reset streak if missed by more than 26 hours
        }

        user.streak += 1;
        user.lastDaily = now;

        await addCoins(userId, totalReward);
        await updateUser(userId, { lastDaily: now, streak: user.streak });

        const embed = new EmbedBuilder()
            .setColor('#00FF00')
            .setTitle('Daily Reward')
            .setDescription(`You received ${totalReward} coins!`)
            .addFields(
                { name: 'Streak', value: `${user.streak} days`, inline: true },
                { name: 'VIP Multiplier', value: `${vipMultiplier}x`, inline: true },
                { name: 'Event Multiplier', value: `${eventMultiplier}x`, inline: true },
                { name: 'Bonus Item', value: bonusItem ? bonusItem.name : 'None', inline: true }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};

import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../../BaseCommand';
import { prisma } from '../../../../database/prisma';
import { addCooldown, checkCooldown } from '../../../../utils/cooldownManager';

export default class RewardCommand extends BaseCommand {
    constructor() {
        super();
        this.data = new SlashCommandBuilder()
            .setName('reward')
            .setDescription('Claim your daily reward!')
            .addStringOption(option =>
                option.setName('type')
                    .setDescription('Type of reward to claim')
                    .setRequired(true)
                    .addChoices(
                        { name: 'daily', value: 'daily' },
                        { name: 'weekly', value: 'weekly' },
                        { name: 'monthly', value: 'monthly' }
                    ));
        this.category = 'Economy';
        this.permissions = [];
        this.cooldown = 86400; // 24 hours for daily rewards
    }

    async execute(interaction) {
        try {
            const rewardType = interaction.options.getString('type');
            const userId = interaction.user.id;
            
            // Check if user is on cooldown
            const cooldownKey = `${rewardType}_reward_${userId}`;
            const remainingCooldown = await checkCooldown(cooldownKey);
            
            if (remainingCooldown > 0) {
                const timeLeft = Math.ceil(remainingCooldown / 1000);
                return await interaction.reply({
                    content: `You need to wait ${timeLeft} seconds before claiming your next ${rewardType} reward!`,
                    ephemeral: true
                });
            }

            // Get or create user data
            let userData = await prisma.user.upsert({
                where: { userId: userId },
                update: {},
                create: {
                    userId: userId,
                    balance: 0,
                    lastReward: new Date(0)
                }
            });

            let rewardAmount;
            let cooldownTime;
            switch(rewardType) {
                case 'daily':
                    rewardAmount = 100;
                    cooldownTime = 86400; // 24 hours
                    break;
                case 'weekly':
                    rewardAmount = 1000;
                    cooldownTime = 604800; // 7 days
                    break;
                case 'monthly':
                    rewardAmount = 5000;
                    cooldownTime = 2592000; // 30 days
                    break;
                default:
                    return await interaction.reply({ content: 'Invalid reward type!', ephemeral: true });
            }

            // Update user's balance
            await prisma.user.update({
                where: { userId: userId },
                data: {
                    balance: userData.balance + rewardAmount,
                    lastReward: new Date()
                }
            });

            // Set cooldown
            await addCooldown(cooldownKey, cooldownTime);

            await interaction.reply({
                content: `🎉 You've claimed your ${rewardType} reward of ${rewardAmount} coins!\nYour new balance is ${userData.balance + rewardAmount} coins!`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Error in reward command:', error);
            await interaction.reply({
                content: 'There was an error processing your reward. Please try again later.',
                ephemeral: true
            });
        }
    }
}
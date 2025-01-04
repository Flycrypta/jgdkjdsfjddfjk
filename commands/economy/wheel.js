import { WHEEL_ITEMS } from '../../utils/itemsList.js';
import { dbManager } from '../../db/database.js';
import { EmbedBuilder } from 'discord.js';
import BaseCommand from '../base-command.js';
import { CONFIG } from '../../config/index.js';
import { CONSTANTS } from '../../utils/constants.js';

const getRandomItem = (items) => {
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
};

const spinWheel = (user) => {
    const spins = 10;
    const vipSpin = 1;
    const rewards = [];

    for (let i = 0; i < spins; i++) {
        const item = getRandomItem(dailyItems);
        rewards.push(item);
    }

    if (user.isVIP) {
        for (let i = 0; i < vipSpin; i++) {
            const jobCategory = jobItems[user.job.toUpperCase()];
            if (jobCategory) {
                const item = getRandomItem(jobCategory);
                rewards.push(item);
            }
        }
    }

    return rewards;
};

export default class WheelCommand extends BaseCommand {
    constructor() {
        super();
        this.data
            .setName('wheel')
            .setDescription('Spin the wheel for rewards!')
            .addStringOption(option =>
                option
                    .setName('type')
                    .setDescription('Type of wheel to spin')
                    .setRequired(true)
                    .addChoices(
                        { name: '🥉 Bronze', value: 'BRONZE' },
                        { name: '🥈 Silver', value: 'SILVER' },
                        { name: '🥇 Gold', value: 'GOLD' },
                        { name: '💎 Platinum', value: 'PLATINUM' }
                    )
            );
        this.category = 'economy';
        this.cooldown = 60; // 1 minute cooldown
    }

    async execute(interaction) {
        try {
            await interaction.deferReply();
            const wheelType = interaction.options.getString('type');
            const wheel = CONFIG.WHEEL_TYPES[wheelType];

            if (!wheel) {
                return await interaction.editReply({ 
                    content: '❌ Invalid wheel type!', 
                    ephemeral: true 
                });
            }

            const reward = await this.spinWheel(wheel);
            const embed = this.createRewardEmbed(wheelType, reward);
            
            await interaction.editReply({ embeds: [embed] });
            this.logger.info(`User ${interaction.user.tag} spun ${wheelType} wheel`);
        } catch (error) {
            await this.handleError(interaction, error);
        }
    }

    spinWheel(wheel) {
        const random = Math.random();
        const isGem = random < wheel.gemChance;
        
        if (isGem) {
            return {
                type: 'gem',
                amount: Math.floor(Math.random() * (wheel.maxReward - wheel.minReward) + wheel.minReward)
            };
        }

        const randomItem = wheel.itemPool[Math.floor(Math.random() * wheel.itemPool.length)];
        return {
            type: 'item',
            item: randomItem
        };
    }

    createRewardEmbed(wheelType, reward) {
        const embed = new EmbedBuilder()
            .setTitle(`🎡 Wheel Spin Result - ${wheelType}`)
            .setColor(this.getWheelColor(wheelType))
            .setTimestamp();

        if (reward.type === 'gem') {
            embed.setDescription(`You won ${CONSTANTS.STATUS_EMOJIS.MONEY} ${reward.amount} gems!`);
        } else {
            embed.setDescription(`You won ${reward.item.name}!`);
        }

        return embed;
    }

    getWheelColor(wheelType) {
        const colors = {
            BRONZE: '#CD7F32',
            SILVER: '#C0C0C0',
            GOLD: '#FFD700',
            PLATINUM: '#E5E4E2'
        };
        return colors[wheelType] || '#000000';
    }
}

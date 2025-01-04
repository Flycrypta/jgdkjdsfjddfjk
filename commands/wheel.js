// New command file for spinning the wheel (example)

import { SlashCommandBuilder } from 'discord.js';
import { dbManager } from '../db/database.js';

export const data = new SlashCommandBuilder()
    .setName('spin')
    .setDescription('Spin the wheel!')
    .addStringOption(option =>
        option.setName('type')
            .setDescription('Which wheel to spin: normal or vip')
            .setChoices(
                { name: 'Normal', value: 'normal' },
                { name: 'VIP', value: 'vip' }
            )
            .setRequired(true));

export async function execute(interaction) {
    try {
        const type = interaction.options.getString('type');
        const userId = interaction.user.id;

        // Get spin usage
        const spinData = await dbManager.stmt.getSpinUsage.get(userId);
        let { daily_spins = 0, vip_spins = 0, last_spin_reset } = spinData || {};

        // Reset spins if it's a new day
        const now = new Date();
        const lastReset = last_spin_reset ? new Date(last_spin_reset) : new Date(0);
        if (lastReset.getDate() !== now.getDate()) {
            daily_spins = 0;
            vip_spins = 0;
        }

        // Check spin limits
        if (type === 'normal' && daily_spins >= interaction.client.wheelSpinsAllowed) {
            return interaction.editReply('You have used all your normal spins today!');
        }
        if (type === 'vip' && vip_spins >= interaction.client.vipWheelSpinsAllowed) {
            return interaction.editReply('You have used all your VIP spins today!');
        }

        // Perform spin
        const result = await dbManager.spinWheel(userId, type);
        
        // Update spin usage
        await dbManager.stmt.updateSpinUsage.run(
            userId,
            type === 'normal' ? daily_spins + 1 : daily_spins,
            type === 'vip' ? vip_spins + 1 : vip_spins,
            now.toISOString()
        );

        // Format result message
        let message = '🎡 ';
        switch(result.type) {
            case 'coins':
                message += `You won ${result.coinReward} coins!`;
                break;
            case 'item':
                message += `You got an item: ${result.name}!`;
                break;
            case 'car':
                message += `🚗 JACKPOT! You won a ${result.name}!`;
                break;
            default:
                message += 'Better luck next time!';
        }

        await interaction.editReply(message);
    } catch (error) {
        console.error('Wheel spin error:', error);
        await interaction.editReply('There was an error processing your spin!');
    }
}

export default { data, execute };
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { dbManager } from '../db/database.js';
import { DatabaseError } from '../db/errors/DatabaseError.js';
import { Logger } from '../utils/logger.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const log = new Logger('CoinsCommand');

export const data = new SlashCommandBuilder()
    .setName('coins')
    .setDescription('Coin management commands')
    .addSubcommand(subcommand => 
        subcommand
            .setName('balance')
            .setDescription('Check your coin balance'))
    .addSubcommand(subcommand => 
        subcommand
            .setName('transfer')
            .setDescription('Transfer coins to another user')
            .addUserOption(option => 
                option.setName('target')
                    .setDescription('User to send coins to')
                    .setRequired(true))
            .addIntegerOption(option => 
                option.setName('amount')
                    .setDescription('Amount of coins to transfer')
                    .setRequired(true))
            .addStringOption(option => 
                option.setName('note')
                    .setDescription('Note for the transfer')))
    .addSubcommand(subcommand => 
        subcommand
            .setName('history')
            .setDescription('View your transaction history'))
    .addSubcommand(subcommand => 
        subcommand
            .setName('gift')
            .setDescription('Gift coins to another user')
            .addUserOption(option => 
                option.setName('target')
                    .setDescription('User to gift coins to')
                    .setRequired(true))
            .addIntegerOption(option => 
                option.setName('amount')
                    .setDescription('Amount of coins to gift')
                    .setRequired(true)));

export async function execute(interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;

        switch (subcommand) {
            case 'balance': {
                const coins = await dbManager.getCoins(userId);
                const embed = new EmbedBuilder()
                    .setTitle('💰 Coin Balance')
                    .setDescription(`You have ${coins.toLocaleString()} coins`)
                    .setColor(0xFFD700)
                    .setTimestamp();
                await interaction.editReply({ embeds: [embed] });
                break;
            }

            case 'transfer': {
                const target = interaction.options.getUser('target');
                const amount = interaction.options.getInteger('amount');
                const note = interaction.options.getString('note') || '';

                if (target.id === userId) {
                    await interaction.editReply('You cannot transfer coins to yourself.');
                    return;
                }

                if (amount <= 0) {
                    await interaction.editReply('Transfer amount must be positive.');
                    return;
                }

                try {
                    await dbManager.transferCoins(userId, target.id, amount, note);
                    const embed = new EmbedBuilder()
                        .setTitle('💸 Transfer Success')
                        .setDescription(`Transferred ${amount.toLocaleString()} coins to ${target.username}`)
                        .setColor(0x00FF00)
                        .setTimestamp();
                    if (note) embed.addFields({ name: 'Note', value: note });
                    await interaction.editReply({ embeds: [embed] });
                } catch (error) {
                    if (error.message === 'Insufficient coins') {
                        await interaction.editReply('You do not have enough coins for this transfer.');
                    } else {
                        throw error;
                    }
                }
                break;
            }

            case 'history': {
                const history = await dbManager.getTransactionHistory(userId);
                const embed = new EmbedBuilder()
                    .setTitle('📜 Transaction History')
                    .setColor(0x0099FF)
                    .setTimestamp();

                if (history.length === 0) {
                    embed.setDescription('No transactions found');
                } else {
                    history.forEach(tx => {
                        const date = new Date(tx.timestamp).toLocaleDateString();
                        embed.addFields({
                            name: `${tx.type} - ${date}`,
                            value: `Amount: ${tx.amount.toLocaleString()} coins\n${tx.description || ''}`
                        });
                    });
                }

                await interaction.editReply({ embeds: [embed] });
                break;
            }

            case 'gift': {
                const target = interaction.options.getUser('target');
                const amount = interaction.options.getInteger('amount');

                if (target.id === userId) {
                    await interaction.editReply('You cannot gift coins to yourself.');
                    return;
                }

                if (amount <= 0) {
                    await interaction.editReply('Gift amount must be positive.');
                    return;
                }

                try {
                    await dbManager.addCoins(target.id, amount);
                    const embed = new EmbedBuilder()
                        .setTitle('🎁 Gift Success')
                        .setDescription(`Gifted ${amount.toLocaleString()} coins to ${target.username}`)
                        .setColor(0x00FF00)
                        .setTimestamp();
                    await interaction.editReply({ embeds: [embed] });
                } catch (error) {
                    throw error;
                }
                break;
            }
        }
    } catch (error) {
        log.error('Coins command error:', error);
        await interaction.editReply('An error occurred while processing the command.');
    }
}

export default { data, execute };

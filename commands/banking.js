import { SlashCommandBuilder } from '@discordjs/builders';
import { BankingManager } from '../modules/banking/BankingManager.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const banking = new BankingManager();

export const data = new SlashCommandBuilder()
    .setName('banking')
    .setDescription('Banking system commands')
    .addSubcommand(subcommand =>
        subcommand
            .setName('invest')
            .setDescription('Invest in stocks or crypto')
            .addStringOption(option =>
                option.setName('type')
                    .setDescription('Investment type')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Stocks', value: 'stock' },
                        { name: 'Crypto', value: 'crypto' }
                    ))
            .addStringOption(option =>
                option.setName('name')
                    .setDescription('Investment name')
                    .setRequired(true))
            .addIntegerOption(option =>
                option.setName('amount')
                    .setDescription('Amount to invest')
                    .setRequired(true)))
    .addSubcommand(subcommand =>
        subcommand
            .setName('business')
            .setDescription('Manage your business'))
    .addSubcommand(subcommand =>
        subcommand
            .setName('vip')
            .setDescription('Check VIP status'));

export async function execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    try {
        switch (subcommand) {
            case 'invest': {
                const type = interaction.options.getString('type');
                const name = interaction.options.getString('name');
                const amount = interaction.options.getInteger('amount');

                const result = await banking.handleInvestment(
                    interaction.user.id,
                    type,
                    name,
                    amount
                );

                await interaction.reply({
                    content: `Successfully invested ${result.quantity} ${result.name} for ${result.total} coins`,
                    ephemeral: true
                });
                break;
            }

            case 'business': {
                const income = await banking.processBusinessIncome(interaction.user.id);
                await interaction.reply({
                    content: `Business income collected: ${income.income} coins`,
                    ephemeral: true
                });
                break;
            }

            case 'vip': {
                const status = await banking.checkVipStatus(interaction.user.id);
                await interaction.reply({
                    content: `VIP Status: ${status.level}\nBenefits: ${status.benefits.join(', ')}`,
                    ephemeral: true
                });
                break;
            }
        }
    } catch (error) {
        await interaction.reply({
            content: `Error: ${error.message}`,
            ephemeral: true
        });
    }
}

export default { data, execute };

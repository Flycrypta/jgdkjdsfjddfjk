import { SlashCommandBuilder } from 'discord.js';
import { resolveImportPath } from '../../utils/paths.js';
import { BANKING } from resolveImportPath('../../utils/economy.js');
import BaseCommand from resolveImportPath('../base-command.js');
import { dbManager } from resolveImportPath('../../db/database.js');

export default class BankCommand extends BaseCommand {
    constructor() {
        super();
        this.data = new SlashCommandBuilder()
            .setName('bank')
            .setDescription('Banking system commands')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('balance')
                    .setDescription('Check your bank balance'))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('deposit')
                    .setDescription('Deposit money into your bank account')
                    .addNumberOption(option =>
                        option.setName('amount')
                            .setDescription('Amount to deposit')
                            .setRequired(true))
                    .addStringOption(option =>
                        option.setName('account')
                            .setDescription('Account type')
                            .setRequired(true)
                            .addChoices(
                                { name: 'Savings', value: 'SAVINGS' },
                                { name: 'Checking', value: 'CHECKING' }
                            )))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('withdraw')
                    .setDescription('Withdraw money from your bank account')
                    .addNumberOption(option =>
                        option.setName('amount')
                            .setDescription('Amount to withdraw')
                            .setRequired(true))
                    .addStringOption(option =>
                        option.setName('account')
                            .setDescription('Account type')
                            .setRequired(true)
                            .addChoices(
                                { name: 'Savings', value: 'SAVINGS' },
                                { name: 'Checking', value: 'CHECKING' }
                            )));
        this.category = 'Economy';
        this.permissions = [];
        this.cooldown = 5;
    }

    async execute(interaction) {
        try {
            await ActivityManager.setActivity(interaction.client, 'Banking');
            const subcommand = interaction.options.getSubcommand();

            switch (subcommand) {
                case 'balance': {
                    const accounts = await BANKING.getAccounts(interaction.user.id);
                    const embed = {
                        title: '🏦 Bank Balance',
                        fields: Object.entries(accounts).map(([type, account]) => ({
                            name: BANKING.ACCOUNTS[type].name,
                            value: formatCurrency(account.balance),
                            inline: true
                        }))
                    };
                    await interaction.reply({ embeds: [embed] });
                    break;
                }
                case 'deposit': {
                    const amount = interaction.options.getNumber('amount');
                    const accountType = interaction.options.getString('account');
                    await BANKING.deposit(interaction.user.id, accountType, amount);
                    await interaction.reply(`Successfully deposited ${formatCurrency(amount)} into your ${BANKING.ACCOUNTS[accountType].name}.`);
                    break;
                }
                case 'withdraw': {
                    const amount = interaction.options.getNumber('amount');
                    const accountType = interaction.options.getString('account');
                    await BANKING.withdraw(interaction.user.id, accountType, amount);
                    await interaction.reply(`Successfully withdrew ${formatCurrency(amount)} from your ${BANKING.ACCOUNTS[accountType].name}.`);
                    break;
                }
            }
        } catch (error) {
            await this.handleError(interaction, error);
        }
    }
};

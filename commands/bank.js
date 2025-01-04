import { SlashCommandBuilder } from '@discordjs/builders';

export const data = new SlashCommandBuilder()
    .setName('bank')
    .setDescription('Banking system commands')
    .addSubcommandGroup(group => 
        group
            .setName('invest')
            .setDescription('Investment commands')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('stocks')
                    .setDescription('Invest in stocks')
                    .addStringOption(option =>
                        option.setName('stock')
                            .setDescription('Stock to invest in')
                            .setRequired(true))
                    .addIntegerOption(option =>
                        option.setName('amount')
                            .setDescription('Amount to invest')
                            .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('crypto')
                    .setDescription('Invest in cryptocurrency')
                    .addStringOption(option =>
                        option.setName('crypto')
                            .setDescription('Cryptocurrency to invest in')
                            .setRequired(true))
                    .addIntegerOption(option =>
                        option.setName('amount')
                            .setDescription('Amount to invest')
                            .setRequired(true))))
    .addSubcommandGroup(group =>
        group
            .setName('business')
            .setDescription('Business commands')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('income')
                    .setDescription('Collect business income'))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('start')
                    .setDescription('Start a new business')
                    .addStringOption(option =>
                        option.setName('type')
                            .setDescription('Type of business')
                            .setRequired(true))))
    .addSubcommandGroup(group =>
        group
            .setName('loan')
            .setDescription('Loan commands')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('apply')
                    .setDescription('Apply for a loan')
                    .addIntegerOption(option =>
                        option.setName('amount')
                            .setDescription('Loan amount')
                            .setRequired(true))
                    .addIntegerOption(option =>
                        option.setName('term')
                            .setDescription('Loan term in months')
                            .setRequired(true))));

export async function execute(interaction) {
    const { client } = interaction;
    const subcommandGroup = interaction.options.getSubcommandGroup();
    const subcommand = interaction.options.getSubcommand();

    try {
        await interaction.deferReply({ ephemeral: true });

        switch (subcommandGroup) {
            case 'invest': {
                const amount = interaction.options.getInteger('amount');
                const asset = interaction.options.getString(subcommand);
                const result = await client.bankingManager.handleInvestment(
                    interaction.user.id,
                    subcommand,
                    asset,
                    amount
                );
                await interaction.editReply(`Investment successful: ${result.message}`);
                break;
            }
            case 'business': {
                if (subcommand === 'income') {
                    const result = await client.bankingManager.processBusinessIncome(interaction.user.id);
                    await interaction.editReply(`Collected business income: ${result.income} coins`);
                }
                break;
            }
            case 'loan': {
                if (subcommand === 'apply') {
                    const amount = interaction.options.getInteger('amount');
                    const term = interaction.options.getInteger('term');
                    const result = await client.bankingManager.applyForLoan(
                        interaction.user.id,
                        amount,
                        term
                    );
                    await interaction.editReply(`Loan application ${result.success ? 'approved' : 'denied'}: ${result.message}`);
                }
                break;
            }
        }
    } catch (error) {
        await interaction.editReply(`Error: ${error.message}`);
    }
}

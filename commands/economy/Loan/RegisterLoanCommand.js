const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('registerloan')
        .setDescription('Register a user profile for a loan and view loans')
        .addSubcommand(subcommand =>
            subcommand
                .setName('register')
                .setDescription('Register for a loan')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Your name')
                        .setRequired(true))
                .addNumberOption(option =>
                    option.setName('amount')
                        .setDescription('Loan amount')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('view')
                .setDescription('View your loans')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const userId = interaction.user.id;
        const loansDir = path.join(__dirname, 'loans');
        await fs.mkdir(loansDir, { recursive: true });

        if (subcommand === 'register') {
            const name = interaction.options.getString('name');
            const amount = interaction.options.getNumber('amount');

            const loanData = {
                userId,
                name,
                amount,
                timestamp: new Date().toISOString()
            };

            await fs.writeFile(
                path.join(loansDir, `loan_${userId}_${Date.now()}.json`),
                JSON.stringify(loanData, null, 2)
            );

            const embed = new MessageEmbed()
                .setTitle('Loan Registered')
                .setColor('#00ff00')
                .setDescription(`Loan registered successfully for ${name}`)
                .addField('Amount', `$${amount.toFixed(2)}`, true)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });

        } else if (subcommand === 'view') {
            const files = await fs.readdir(loansDir);
            const userLoans = files.filter(file => file.startsWith(`loan_${userId}_`));

            if (userLoans.length === 0) {
                return await interaction.reply({
                    content: 'You have no registered loans.',
                    ephemeral: true
                });
            }

            const loans = await Promise.all(userLoans.map(async file => {
                const data = await fs.readFile(path.join(loansDir, file), 'utf-8');
                return JSON.parse(data);
            }));

            const embed = new MessageEmbed()
                .setTitle('Your Loans')
                .setColor('#0099ff')
                .setTimestamp();

            loans.forEach((loan, index) => {
                embed.addField(
                    `Loan ${index + 1}`,
                    `Name: ${loan.name}\nAmount: $${loan.amount.toFixed(2)}\nDate: ${new Date(loan.timestamp).toLocaleDateString()}`,
                    false
                );
            });

            await interaction.reply({ embeds: [embed] });
        }
    },
};

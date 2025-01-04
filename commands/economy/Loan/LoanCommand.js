import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { promises as fs } from 'fs';
import path from 'path';
import { LoanCalculator } from './modules/LoanCalculator.js';
import { validateItems } from './modules/validators.js';

const data = new SlashCommandBuilder()
    .setName('loan')
    .setDescription('Calculate and display a loan invoice')
    .addStringOption(option => 
        option.setName('customer')
            .setDescription('The name of the customer')
            .setRequired(true))
    .addStringOption(option => 
        option.setName('items')
            .setDescription('The items in JSON format: [{"name":"item","price":10,"quantity":1}]')
            .setRequired(true))
    .addNumberOption(option =>
        option.setName('discount')
            .setDescription('Discount percentage (0-100)')
            .setMinValue(0)
            .setMaxValue(100));

async function execute(interaction) {
    try {
        const customer = interaction.options.getString('customer');
        const itemsString = interaction.options.getString('items');
        const discount = interaction.options.getNumber('discount') || 0;

        // Parse and validate items
        let items;
        try {
            items = JSON.parse(itemsString);
            if (!validateItems(items)) {
                throw new Error('Invalid items format');
            }
        } catch (error) {
            return await interaction.reply({
                content: 'Invalid JSON format. Please use the format: [{"name":"item","price":10,"quantity":1}]',
                ephemeral: true
            });
        }

        // Calculate invoice
        const calculator = new LoanCalculator();
        const invoice = calculator.generate_invoice(customer, items, discount);
        const invoiceEmbeds = calculator.create_invoice_embed(invoice);

        // Save invoice to file
        const invoiceData = {
            timestamp: new Date().toISOString(),
            userId: interaction.user.id,
            ...invoice
        };

        const invoicesDir = path.join(__dirname, 'invoices');
        await fs.mkdir(invoicesDir, { recursive: true });
        await fs.writeFile(
            path.join(invoicesDir, `invoice_${Date.now()}.json`),
            JSON.stringify(invoiceData, null, 2)
        );

        await interaction.reply({ 
            embeds: invoiceEmbeds,
            content: '📊 Here is your detailed invoice breakdown:'
        });

    } catch (error) {
        console.error('Loan command error:', error);
        await interaction.reply({
            content: 'An error occurred while processing your request.',
            ephemeral: true
        });
    }
}

export { data, execute };

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { dbManager } from '../db/database.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure DatabaseError is imported only once
// import { DatabaseError } from '../db/errors/DatabaseError.js';

export const data = new SlashCommandBuilder()
    .setName('loan')
    .setDescription('Apply for a loan.')
    .addIntegerOption(option =>
        option
            .setName('amount')
            .setDescription('Loan amount (100-10000)')
            .setRequired(true)
            .setMinValue(100)
            .setMaxValue(10000)
    )
    .addIntegerOption(option =>
        option
            .setName('term')
            .setDescription('Loan term in months (1-24)')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(24)
    );

export async function execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    const term = interaction.options.getInteger('term');
    const userId = interaction.user.id;

    try {
        const result = await dbManager.applyForLoan(userId, amount, term);
        
        const embed = new EmbedBuilder()
            .setColor(result.success ? '#00ff00' : '#ff0000')
            .setTitle('Loan Application')
            .addFields(
                { name: 'Status', value: result.success ? 'Approved' : 'Denied' },
                { name: 'Amount', value: `$${amount}` },
                { name: 'Term', value: `${term} months` },
                { name: 'Message', value: result.message }
            );

        await interaction.reply({ embeds: [embed] });
    } catch (error) {
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('Error')
            .setDescription(`Failed to apply for loan: ${error.message}`);
            
        await interaction.reply({ embeds: [errorEmbed] });
    }
}

export default { data, execute };

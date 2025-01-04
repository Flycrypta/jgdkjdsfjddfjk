import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { dbManager } from '../db/database.js';
import { CARS, CAR_MODS } from '../utils/index.js';
import { ErrorHandler } from '../utils/errorHandler.js';

export const data = new SlashCommandBuilder()
    .setName('mod')
    .setDescription('Modify your car')
    .addStringOption(option =>
        option.setName('car')
            .setDescription('Car to modify')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('category')
            .setDescription('Modification category')
            .setRequired(true)
            .addChoices(
                { name: 'Engine', value: 'Engine' },
                { name: 'Exhaust', value: 'Exhaust' },
                { name: 'Suspension', value: 'Suspension' },
                { name: 'Luxury', value: 'Luxury' } // New category
            ))
    .addStringOption(option =>
        option.setName('type')
            .setDescription('Modification type')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('brand')
            .setDescription('Brand of the modification')
            .setRequired(true));

export async function execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
        const carName = interaction.options.getString('car');
        const category = interaction.options.getString('category');
        const type = interaction.options.getString('type');
        const brand = interaction.options.getString('brand');

        // Get user data first
        const userData = await dbManager.getUser(interaction.user.id).catch(error => {
            throw new Error(`Failed to get user data: ${error.message}`);
        });

        if (!userData) {
            return interaction.editReply('User not found in database. Please try again.');
        }

        const car = CARS.find(c => c.name.toLowerCase() === carName.toLowerCase());
        if (!car) {
            return interaction.editReply(`Car '${carName}' not found.`);
        }

        const mod = CAR_MODS[category]?.[type]?.find(m => 
            m.brand.toLowerCase() === brand.toLowerCase() &&
            (m.compatibility.includes('all') || m.compatibility.includes(car.region))
        );

        if (!mod) {
            return interaction.editReply(`Invalid modification or incompatible with ${carName}.`);
        }

        const userCar = await dbManager.getCarFromInventory(interaction.user.id, carName);
        if (!userCar) {
            return interaction.editReply(`You don't own a ${carName}.`);
        }

        if (userData.coins < mod.value) {
            return interaction.editReply(`You need ${mod.value} coins to install ${mod.brand} ${mod.name}.`);
        }

        await dbManager.addCoins(interaction.user.id, -mod.value);
        await dbManager.addCarMod(interaction.user.id, userCar.id, mod.id);

        const embed = new EmbedBuilder()
            .setTitle('🔧 Car Modified')
            .setDescription(`Successfully installed ${mod.brand} ${mod.name} on your ${carName}!`)
            .setColor(0x00FF00)
            .setThumbnail('https://example.com/mod-thumbnail.png') // Add a thumbnail image
            .addFields(
                { name: 'Cost', value: `${mod.value} coins`, inline: true },
                { name: 'HP Gain', value: `+${mod.hpGain || 0}`, inline: true }
            )
            .setFooter({ text: 'Car Modification System', iconURL: 'https://example.com/footer-icon.png' }) // Add a footer
            .setTimestamp(); // Add a timestamp

        return interaction.editReply({ embeds: [embed] });
    } catch (error) {
        await ErrorHandler.handle(error, interaction, interaction.client, process.env.SKIP_ERRORS === 'true');
        
        if (process.env.SKIP_ERRORS === 'true') {
            return interaction.editReply({ 
                content: 'Command completed with some errors. Check logs for details.',
                ephemeral: true 
            });
        }
        
        return interaction.editReply('An error occurred while modifying your car.');
    }
}

export default { data, execute };

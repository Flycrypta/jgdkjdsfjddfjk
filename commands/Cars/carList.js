import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../base-command.js';
import { dbManager } from '../../db/database.js';

// Example of a file providing 25 car objects, just a snippet (use your existing array logic)

export const allCars = [
    { id: 1, name: 'Toyota Supra MK4', make: 'Toyota', model: 'Supra', year: 1998, baseHp: 320, price: 85000, rarity: 'epic', modifications: [], type: 'Sports' },
    { id: 2, name: 'Nissan Skyline GT-R R34', make: 'Nissan', model: 'Skyline', year: 1999, baseHp: 280, price: 120000, rarity: 'legendary', modifications: [], type: 'Sports' },
    { id: 3, name: 'Mercedes-Benz S63 AMG', make: 'Mercedes-Benz', model: 'S63 AMG', year: 2023, baseHp: 612, price: 185000, rarity: 'epic', modifications: [], type: 'Luxury' },
    { id: 4, name: 'BMW M5 Competition', make: 'BMW', model: 'M5', year: 2023, baseHp: 617, price: 145000, rarity: 'epic', modifications: [], type: 'Sport Sedan' },
    { id: 5, name: 'Dodge Challenger Hellcat', make: 'Dodge', model: 'Challenger', year: 2023, baseHp: 717, price: 75000, rarity: 'rare', modifications: [], type: 'Muscle' },
    { id: 6, name: 'Lamborghini Huracán', make: 'Lamborghini', model: 'Huracán', year: 2023, baseHp: 631, price: 275000, rarity: 'legendary', modifications: [], type: 'Supercar' },
    { id: 7, name: '1967 Ford Mustang', make: 'Ford', model: 'Mustang', year: 1967, baseHp: 320, price: 95000, rarity: 'epic', modifications: [], type: 'Classic' },
    { id: 8, name: 'Honda Civic Type R', make: 'Honda', model: 'Civic', year: 2023, baseHp: 315, price: 45000, rarity: 'rare', modifications: [], type: 'Sport Compact' },
    { id: 9, name: 'Mitsubishi Lancer Evolution X', make: 'Mitsubishi', model: 'Lancer Evolution', year: 2015, baseHp: 291, price: 40000, rarity: 'rare', modifications: [], type: 'Sports' },
    { id: 10, name: 'Porsche 911 GT3', make: 'Porsche', model: '911', year: 2023, baseHp: 502, price: 175000, rarity: 'legendary', modifications: [], type: 'Sports' },
    { id: 11, name: 'Tesla Model S Plaid', make: 'Tesla', model: 'Model S', year: 2023, baseHp: 1020, price: 135000, rarity: 'epic', modifications: [], type: 'Electric' },
    { id: 12, name: 'Bugatti Chiron', make: 'Bugatti', model: 'Chiron', year: 2023, baseHp: 1479, price: 3000000, rarity: 'mythical', modifications: [], type: 'Hypercar' },
    { id: 13, name: 'Subaru WRX STI', make: 'Subaru', model: 'WRX STI', year: 2021, baseHp: 310, price: 42000, rarity: 'rare', modifications: [], type: 'Rally Sport' },
    { id: 14, name: 'Audi RS7', make: 'Audi', model: 'RS7', year: 2023, baseHp: 591, price: 125000, rarity: 'epic', modifications: [], type: 'Sport Luxury' },
    { id: 15, name: 'Ferrari F8 Tributo', make: 'Ferrari', model: 'F8 Tributo', year: 2023, baseHp: 710, price: 280000, rarity: 'legendary', modifications: [], type: 'Supercar' },
    { id: 16, name: 'Aston Martin DBS', make: 'Aston Martin', model: 'DBS', year: 2023, baseHp: 715, price: 330000, rarity: 'legendary', modifications: [], type: 'Grand Tourer' },
    { id: 17, name: 'Chevrolet Corvette Z06', make: 'Chevrolet', model: 'Corvette', year: 2023, baseHp: 670, price: 110000, rarity: 'epic', modifications: [], type: 'Sports' },
    { id: 18, name: 'Porsche Taycan Turbo S', make: 'Porsche', model: 'Taycan', year: 2023, baseHp: 750, price: 185000, rarity: 'epic', modifications: [], type: 'Electric' },
    { id: 19, name: 'Mazda RX-7 FD', make: 'Mazda', model: 'RX-7', year: 1995, baseHp: 276, price: 65000, rarity: 'epic', modifications: [], type: 'Sports' },
    { id: 20, name: 'Ford Mustang Shelby GT500', make: 'Ford', model: 'Mustang', year: 2023, baseHp: 760, price: 80000, rarity: 'epic', modifications: [], type: 'Muscle' },
    { id: 21, name: 'McLaren P1', make: 'McLaren', model: 'P1', year: 2015, baseHp: 903, price: 1500000, rarity: 'mythical', modifications: [], type: 'Hypercar' },
    { id: 22, name: 'Lamborghini Urus', make: 'Lamborghini', model: 'Urus', year: 2023, baseHp: 641, price: 230000, rarity: 'epic', modifications: [], type: 'SUV' },
    { id: 23, name: 'Ferrari F40', make: 'Ferrari', model: 'F40', year: 1992, baseHp: 471, price: 2200000, rarity: 'mythical', modifications: [], type: 'Classic Supercar' },
    { id: 24, name: 'Koenigsegg Jesko', make: 'Koenigsegg', model: 'Jesko', year: 2023, baseHp: 1600, price: 3000000, rarity: 'mythical', modifications: [], type: 'Hypercar' },
    { id: 25, name: 'Pagani Huayra BC', make: 'Pagani', model: 'Huayra BC', year: 2023, baseHp: 791, price: 3500000, rarity: 'mythical', modifications: [], type: 'Hypercar' }
];

export default class CarListCommand extends BaseCommand {
    constructor() {
        super();
        this.data = new SlashCommandBuilder()
            .setName('carlist')
            .setDescription('List all available cars')
            .addStringOption(option =>
                option
                    .setName('filter')
                    .setDescription('Filter cars by type')
                    .setRequired(false)
                    .addChoices(
                        { name: 'Sports', value: 'Sports' },
                        { name: 'Luxury', value: 'Luxury' },
                        { name: 'Muscle', value: 'Muscle' },
                        { name: 'Supercar', value: 'Supercar' },
                        { name: 'Classic', value: 'Classic' },
                        { name: 'Electric', value: 'Electric' },
                        { name: 'Hypercar', value: 'Hypercar' }
                    ));
        this.category = 'Cars';
        this.permissions = [];
        this.cooldown = 5;
    }

    async execute(interaction) {
        try {
            const filter = interaction.options.getString('filter');
            const cars = filter ? allCars.filter(car => car.type === filter) : allCars;
            
            const embed = {
                title: filter ? `${filter} Cars List` : 'All Cars List',
                description: cars.map(car => 
                    `**${car.name}** (${car.year}) - ${car.baseHp}hp - $${car.price.toLocaleString()} - ${car.rarity}`
                ).join('\n'),
                color: 0x0099FF
            };

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            await this.handleError(interaction, error);
        }
    }
}
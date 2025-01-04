import { EmbedBuilder } from 'discord.js';
import { carEmojis } from '../../config/gameData.js';

export function createCarEmbed(car, vin) {
    const embed = new EmbedBuilder()
        .setTitle(`${carEmojis[car.type]} ${car.name}`)
        .setDescription(`VIN: ${vin}`)
        .addFields([
            { name: 'Performance', value: `
                🐎 HP: ${car.stats.hp}
                🔄 Torque: ${car.stats.torque}
                ⚡ 0-60: ${car.stats.acceleration}s
                🏁 Top Speed: ${car.stats.topSpeed} mph
            `},
            { name: 'Economics', value: `
                💰 Price: $${car.basePrice.toLocaleString()}
                ⛽ MPG: ${car.fuelEconomy}
                🔧 Maintenance: $${car.maintenanceCost}/yr
                📄 Insurance: $${car.insurance}/yr
            `}
        ])
        .setColor(car.condition === 100 ? '#00ff00' : '#ffff00')
        .setFooter({ text: `Reliability: ${car.reliability}% | Type: ${car.type}` });

    return embed;
}

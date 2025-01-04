import { SlashCommandBuilder } from '@discordjs/builders';
import { EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Attempt to rob another user')
    .addUserOption(option => 
        option.setName('target')
            .setDescription('User to rob')
            .setRequired(true));

export async function execute(interaction) {
    const target = interaction.options.getUser('target');
    const userId = interaction.user.id;

    if (target.id === userId) {
        return interaction.reply({ 
            content: "You can't rob yourself!", 
            ephemeral: true 
        });
    }

    try {
        // Get attacker and defender stats
        const [attacker, defender] = await Promise.all([
            interaction.client.db.get('SELECT * FROM user_stats WHERE user_id = ?', [userId]),
            interaction.client.db.get('SELECT * FROM user_stats WHERE user_id = ?', [target.id])
        ]);

        // Calculate damage based on equipment
        const attackerEquipment = await interaction.client.db.all(
            `SELECT * FROM item_instances ii 
             JOIN items i ON ii.item_id = i.id 
             WHERE owner_id = ? AND i.type IN ('weapon', 'armor')`,
            [userId]
        );

        const totalDamage = calculateDamage(attacker, attackerEquipment);
        const success = Math.random() < 0.6; // 60% success rate

        if (success) {
            const stolenAmount = Math.floor(Math.random() * 100) + 50;
            
            await interaction.client.db.run(
                'UPDATE user_stats SET health = max(0, health - ?) WHERE user_id = ?',
                [totalDamage, target.id]
            );

            await interaction.client.db.run(
                'UPDATE users SET coins = coins + ? WHERE id = ?',
                [stolenAmount, userId]
            );

            const weapon = attackerEquipment.find(e => e.type === 'weapon');
            const embed = new EmbedBuilder()
                .setTitle('⚔️ Combat Result')
                .setDescription(`You attacked ${target.username}!`)
                .addFields(
                    { name: 'Damage Dealt', value: `${totalDamage}`, inline: true },
                    { name: 'Coins Stolen', value: `${stolenAmount}`, inline: true }
                )
                .setColor(0xFF0000);

            if (weapon?.image) {
                embed.setThumbnail(weapon.image);
            }

            return interaction.reply({ embeds: [embed] });
        }

        await interaction.reply(`Your attempt to rob ${target.username} failed!`);

    } catch (error) {
        console.error(error);
        await interaction.reply({ 
            content: 'Failed to process rob attempt', 
            ephemeral: true 
        });
    }
}

function calculateDamage(attacker, equipment) {
    let baseDamage = attacker.strength;
    
    equipment.forEach(item => {
        if (item.type === 'weapon') {
            baseDamage += item.damage || 0;
        }
    });

    return Math.floor(baseDamage * (Math.random() * 0.5 + 0.75));
}

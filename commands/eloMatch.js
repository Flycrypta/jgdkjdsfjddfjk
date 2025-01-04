
// Example command to join/leave a matchmaking queue and show ELO

import { SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('elo')
    .setDescription('ELO matchmaking commands')
    .addSubcommand(s => 
        s.setName('join')
         .setDescription('Join the matchmaking queue'))
    .addSubcommand(s =>
        s.setName('leave')
         .setDescription('Leave the matchmaking queue'))
    .addSubcommand(s =>
        s.setName('rating')
         .setDescription('Check your ELO rating'));

export async function execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const userId = interaction.user.id;

    if (subcommand === 'join') {
        interaction.client.eloMatchQueue.set(userId, true);
        return interaction.reply({ content: 'You joined the ELO match queue!', ephemeral: true });
    } else if (subcommand === 'leave') {
        interaction.client.eloMatchQueue.delete(userId);
        return interaction.reply({ content: 'You left the match queue.', ephemeral: true });
    } else if (subcommand === 'rating') {
        const row = interaction.client.dbManager.stmt.getElo.get(userId);
        const rating = row ? row.elo : 1000;
        return interaction.reply({ content: `Your ELO rating is ${rating}`, ephemeral: true });
    }
}

export default { data, execute };
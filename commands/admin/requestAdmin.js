import { SlashCommandBuilder } from 'discord.js';

const command = {
    data: new SlashCommandBuilder()
        .setName('requestadmin')
        .setDescription('Request admin roles from the server owner'),
    
    async execute(interaction) {
        const owner = interaction.guild.ownerId;
        const user = interaction.user;

        // Send a request to the owner
        const ownerUser = await interaction.client.users.fetch(owner);
        await ownerUser.send(`${user.username} has requested admin roles.`);

        await interaction.reply({ content: 'Your request for admin roles has been sent to the server owner.', ephemeral: true });
    }
};

export default command;

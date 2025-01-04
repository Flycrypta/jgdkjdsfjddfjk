import { Logger } from '../utils/logger.js';

const log = new Logger('InteractionEvent');

export const name = 'interactionCreate';

export async function execute(interaction) {
    if (!interaction.isCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        log.error(`Error executing command ${interaction.commandName}:`, error);
        const errorMessage = { 
            content: 'There was an error executing this command!', 
            ephemeral: true 
        };
        
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }
}

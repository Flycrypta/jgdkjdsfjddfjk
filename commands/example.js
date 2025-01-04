import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../base-command.js';
import { dbManager } from '../db/database.js';
import { DatabaseError } from '../db/errors/DatabaseError.js'; // Use centralized error
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default class ExampleCommand extends BaseCommand {
    constructor() {
        super();
        this.data = new SlashCommandBuilder()
            .setName('commandname')
            .setDescription('Command description');
        this.category = 'Category';
        this.permissions = [];
        this.cooldown = 5;
    }

    async execute(interaction) {
        try {
            // Database operation
            const result = await dbManager.someOperation();
            
            if (!result) {
                throw new DatabaseError('QUERY', {
                    message: 'Failed to fetch data',
                    userMessage: 'Could not retrieve the requested information',
                    operation: 'someOperation'
                });
            }
            
            await interaction.reply('Success!');
        } catch (error) {
            const handled = DatabaseError.handle(error, {
                userId: interaction.user.id,
                command: interaction.commandName
            });
            
            console.error(handled.logMessage);
            await interaction.reply({
                content: handled.userMessage,
                ephemeral: true
            });
        }
    }
}

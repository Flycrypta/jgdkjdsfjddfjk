import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class CommandLoader {
    static async loadCommands() {
        const commands = new Collection();
        const commandsPath = join(__dirname, '..', 'commands');
        
        try {
            const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            
            for (const file of commandFiles) {
                const filePath = `file://${join(commandsPath, file)}`;
                const command = await import(filePath);
                
                if ('data' in command && 'execute' in command) {
                    commands.set(command.data.name, command);
                }
            }
            
            return commands;
        } catch (error) {
            console.error('Error loading commands:', error);
            throw error;
        }
    }
}

import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { baseCommands } from '../commands/registry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class CommandHandler {
    constructor(client) {
        this.client = client;
        this.commands = new Collection();
        this.cooldowns = new Collection();
        
        // Load base commands on initialization
        baseCommands.forEach(cmd => this.addCommand(cmd));
    }

    addCommand(command) {
        this.commands.set(command.name, {
            ...command,
            category: command.category || 'General'
        });
    }

    async loadCommands() {
        try {
            // First load base commands
            baseCommands.forEach(cmd => this.addCommand(cmd));

            // Then load file-based commands
            const commandsPath = join(__dirname, '..', 'commands');
            const categories = readdirSync(commandsPath).filter(dir => 
                dir !== 'registry.js' && 
                readdirSync(join(commandsPath, dir)).length > 0
            );

            for (const category of categories) {
                const categoryPath = join(commandsPath, category);
                const commandFiles = readdirSync(categoryPath).filter(file => file.endsWith('.js'));
                
                for (const file of commandFiles) {
                    try {
                        const commandPath = join(categoryPath, file);
                        const commandUrl = `file://${commandPath.replace(/\\/g, '/')}`;
                        const command = await import(commandUrl);
                        if (command.default?.name && !this.commands.has(command.default.name)) {
                            this.addCommand({
                                ...command.default,
                                category
                            });
                            console.log(`Loaded command: ${command.default.name}`);
                        }
                    } catch (error) {
                        console.error(`Error loading command ${file}:`, error);
                    }
                }
            }

            return this.commands;
        } catch (error) {
            console.error('Error loading commands:', error);
        }
    }

    async handleCommand(interaction) {
        try {
            const command = this.commands.get(interaction.commandName);
            
            if (!command) {
                await interaction.reply({
                    content: 'That command does not exist.',
                    ephemeral: true
                });
                return;
            }

            // Check cooldown
            if (command.cooldown) {
                const cooldown = this.cooldowns.get(`${interaction.user.id}-${command.name}`);
                if (cooldown && cooldown > Date.now()) {
                    const timeLeft = Math.ceil((cooldown - Date.now()) / 1000);
                    await interaction.reply({
                        content: `Please wait ${timeLeft} seconds before using this command again.`,
                        ephemeral: true
                    });
                    return;
                }
                this.cooldowns.set(
                    `${interaction.user.id}-${command.name}`, 
                    Date.now() + (command.cooldown * 1000)
                );
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing command ${command.name}:`, error);
                const reply = {
                    content: 'There was an error executing this command!',
                    ephemeral: true
                };
                
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp(reply);
                } else {
                    await interaction.reply(reply);
                }
            }
        } catch (error) {
            console.error('Error handling command:', error);
        }
    }

    getCommand(name) {
        return this.commands.get(name);
    }

    getAllCommands() {
        return this.commands;
    }

    registerCommand(command) {
        if ('data' in command && 'execute' in command) {
            this.commands.set(command.data.name, command);
            return true;
        }
        return false;
    }
}

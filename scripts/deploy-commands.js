import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load environment variables
config();

// Validate environment variables
const requiredEnvVars = ['DISCORD_TOKEN', 'CLIENT_ID', 'GUILD_ID'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
    console.error('Missing required environment variables:', missingEnvVars.join(', '));
    console.error('Please check your .env file and ensure all required variables are set.');
    process.exit(1);
}

async function validateCommand(command) {
    if (!command || !command.data) {
        throw new Error('Invalid command structure');
    }
    
    const requiredFields = ['name', 'description'];
    for (const field of requiredFields) {
        if (!command.data[field]) {
            throw new Error(`Command missing required field: ${field}`);
        }
    }
}

async function deployCommands() {
    try {
        const commands = [];
        const commandsPath = join(__dirname, '..', 'commands');
        
        if (!readdirSync(commandsPath)) {
            throw new Error('Commands directory not found');
        }

        const commandFiles = readdirSync(commandsPath)
            .filter(file => file.endsWith('.js'))
            .filter(file => !['base-command.js', 'command-template.js'].includes(file));
        
        console.log(`Loading ${commandFiles.length} command files...`);
        
        for (const file of commandFiles) {
            const filePath = `file://${join(commandsPath, file)}`;
            try {
                const command = await import(filePath);
                if (command.data) {
                    await validateCommand(command);
                    commands.push(command.data.toJSON());
                    console.log(`✓ Loaded command: ${command.data.name}`);
                }
            } catch (error) {
                console.error(`× Failed to load command ${file}:`, error.message);
            }
        }

        if (commands.length === 0) {
            throw new Error('No valid commands found to deploy');
        }

        const rest = new REST().setToken(process.env.DISCORD_TOKEN);

        console.log(`Deploying ${commands.length} commands...`);

        const data = await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands },
        );

        console.log(`Successfully deployed ${data.length} commands!`);
        return true;
    } catch (error) {
        console.error('Deployment failed:', error.message);
        return false;
    }
}

deployCommands().then(success => process.exit(success ? 0 : 1));

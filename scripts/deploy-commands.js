import { REST, Routes } from 'discord.js';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
config();

const { DISCORD_TOKEN, CLIENT_ID, GUILD_ID } = process.env;

// Validate environment variables
if (!DISCORD_TOKEN || !CLIENT_ID) {
    console.error('Missing required environment variables:');
    if (!DISCORD_TOKEN) console.error('- DISCORD_TOKEN');
    if (!CLIENT_ID) console.error('- CLIENT_ID');
    process.exit(1);
}

const commands = [];
const foldersPath = join(__dirname, '..', 'commands');

try {
    // Recursively get all command files
    const getCommands = async (dir) => {
        const files = readdirSync(dir, { withFileTypes: true });
        
        for (const file of files) {
            const filePath = join(dir, file.name);
            
            if (file.isDirectory()) {
                await getCommands(filePath);
                continue;
            }

            if (!file.name.endsWith('.js')) continue;

            try {
                const command = await import(`file://${filePath}`);
                if (command?.default?.data && command?.default?.execute) {
                    commands.push(command.default.data.toJSON());
                    console.log(`Loaded command: ${command.default.data.name}`);
                }
            } catch (error) {
                console.log(`[WARNING] Error loading command ${filePath}: ${error}`);
            }
        }
    };

    await getCommands(foldersPath);

    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
    
    console.log(`Starting deployment for Application ID: ${CLIENT_ID}`);
    console.log(`Deploying ${commands.length} commands...`);

    // Try guild-specific deployment first if GUILD_ID is available
    if (GUILD_ID) {
        try {
            await rest.put(
                Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
                { body: commands },
            );
            console.log('Successfully deployed commands to guild!');
            process.exit(0);
        } catch (error) {
            console.warn('Guild deployment failed, falling back to global deployment:', error.message);
        }
    }

    // Global deployment
    try {
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );
        console.log('Successfully deployed commands globally!');
    } catch (error) {
        if (error.code === 10002) {
            console.error('Error: Invalid application ID. Please check your CLIENT_ID in .env');
        } else {
            console.error('Error deploying commands:', error);
        }
        process.exit(1);
    }
} catch (error) {
    console.error('Error:', error);
    process.exit(1);
}

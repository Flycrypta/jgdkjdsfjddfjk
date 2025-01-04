import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Logger } from '../utils/logger.js';

const log = new Logger('CommandHandler');
const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadCommands(client) {
    client.commands = new Collection();
    const foldersPath = join(__dirname, '..', 'commands');

    try {
        const processDirectory = async (dirPath) => {
            const files = readdirSync(dirPath, { withFileTypes: true });
            
            for (const file of files) {
                const filePath = join(dirPath, file.name);
                
                if (file.isDirectory()) {
                    await processDirectory(filePath);
                    continue;
                }

                if (!file.name.endsWith('.js')) continue;

                try {
                    const command = await import(`file://${filePath}`);
                    if (command?.default?.data && command?.default?.execute) {
                        client.commands.set(command.default.data.name, command.default);
                        log.info(`Loaded command: ${command.default.data.name}`);
                    } else {
                        log.warn(`Invalid command format in ${file.name}`);
                    }
                } catch (error) {
                    log.error(`Error loading command ${filePath}: ${error}`);
                }
            }
        };

        await processDirectory(foldersPath);
        log.info(`Loaded ${client.commands.size} commands`);
    } catch (error) {
        log.error('Failed to load commands:', error);
        throw error;
    }
}

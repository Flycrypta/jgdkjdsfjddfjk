import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Logger } from '../utils/logger.js';

const log = new Logger('CommandHandler');
const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadCommands(client) {
    const commandsPath = join(__dirname, '..', 'commands');
    const commandFolders = readdirSync(commandsPath);

    for (const folder of commandFolders) {
        const folderPath = join(commandsPath, folder);
        const commandFiles = readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            try {
                const filePath = join(folderPath, file);
                const command = await import(filePath);

                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    log.info(`Loaded command: ${command.data.name}`);
                } else {
                    log.warn(`Invalid command at ${filePath}`);
                }
            } catch (error) {
                log.error(`Error loading command ${file}:`, error);
            }
        }
    }
}

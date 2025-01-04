import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Logger } from '../utils/logger.js';
import { fileToURL, getFilePath } from '../utils/pathUtils.js';

const log = new Logger('EventHandler');
const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadEvents(client) {
    const eventsPath = join(__dirname, '..', 'events');
    const eventFiles = readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        try {
            const filePath = fileToURL(join(eventsPath, file));
            const event = await import(filePath);

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }

            log.info(`Loaded event: ${event.name}`);
        } catch (error) {
            log.error(`Error loading event ${file}:`, error);
        }
    }
}

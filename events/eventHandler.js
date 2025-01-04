import { Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { join, pathToFileURL } from 'path';

export class EventHandler {
    constructor(client) {
        this.client = client;
        this.events = new Collection();
    }

    async loadEvents() {
        const eventsPath = join(process.cwd(), 'events');
        const eventFiles = readdirSync(eventsPath)
            .filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = pathToFileURL(join(eventsPath, file)).href;
            try {
                const event = await import(filePath);
                const eventName = file.split('.')[0];

                this.client.on(eventName, (...args) => event.execute(...args, this.client));
                this.events.set(eventName, event);
            } catch (error) {
                console.warn(`[WARNING] Could not load event ${file}: ${error.message}`);
            }
        }
    }
}

import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from 'dotenv';
import { loadCommands } from './handlers/commandHandler.js';
import { loadEvents } from './handlers/eventHandler.js';
import { Logger } from './utils/logger.js';

config();
const log = new Logger('Bot');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
client.cooldowns = new Collection();

async function initialize() {
    try {
        await loadCommands(client);
        await loadEvents(client);
        await client.login(process.env.TOKEN);
        log.info('Bot initialized successfully');
    } catch (error) {
        log.error('Failed to initialize bot:', error);
        process.exit(1);
    }
}

initialize();

process.on('unhandledRejection', (error) => {
    log.error('Unhandled promise rejection:', error);
});

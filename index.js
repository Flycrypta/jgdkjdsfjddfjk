import { Client, GatewayIntentBits, Collection } from 'discord.js';
import { config } from 'dotenv';
import { dbManager } from './db/database.js';
import { loadCommands } from './handlers/commandHandler.js';
import { loadEvents } from './handlers/eventHandler.js';
import { Logger } from './utils/logger.js';
import { ErrorHandler } from './utils/errorHandler.js';
import { BackupManager } from './db/managers/BackupManager.js';
import { SyncService } from './vpsdb/syncService.js';

config();
const log = new Logger('Bot');

// VPS IP Configuration
const vpsIPs = [
    '172.86.108.64',
    process.env.VPS_IP_2
    // Add more IPs as needed
];

// Database Configuration
const dbConfig = {
    local: {
        host: '172.86.108.64',  // Changed from localhost
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: parseInt(process.env.DB_PORT) || 3306,
        allowedIPs: ['172.86.108.64', ...vpsIPs]  // Added remote IP
    },
    vps: {
        host: process.env.VPS_DB_HOST,
        user: process.env.VPS_DB_USER,
        password: process.env.VPS_DB_PASSWORD,
        database: process.env.VPS_DB_NAME,
        port: parseInt(process.env.VPS_DB_PORT) || 3306,
        allowedIPs: vpsIPs
    }
};

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Initialize collections
client.commands = new Collection();
client.cooldowns = new Collection();
client.dbManager = new DatabaseManager(dbConfig);
client.backupManager = new BackupManager('./data/backups');

// Start database backup schedule
client.backupManager.startScheduledBackups();

const syncService = new SyncService(dbConfig);

// Initialize error handler
const errorHandler = new ErrorHandler();

async function initialize() {
    try {
        // Connect to database
        await client.dbManager.initialize();
        log.info('Database initialized');

        // Load commands and events
        await loadCommands(client);
        await loadEvents(client);
        
        // Initialize and test sync service
        await syncService.initialize();
        const syncTest = await syncService.verifySyncTables(syncService.localPool);
        if (!syncTest) {
            log.warn('Sync tables missing, running initialization...');
            await import('./scripts/init-sync-tables.js');
        }
        await syncService.startSync();
        log.info('Sync service started');
        
        // Login bot
        await client.login(process.env.DISCORD_TOKEN);
        log.info('Bot initialized successfully');

        // Set activity
        client.user.setActivity('cars and economy', { type: 'PLAYING' });
    } catch (error) {
        log.error('Failed to initialize bot:', error);
        process.exit(1);
    }
}

initialize();

// Event: Interaction Create
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    try {
        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        await command.execute(interaction);
    } catch (error) {
        await errorHandler.handle(error, interaction);
    }
});

// Error handling
process.on('unhandledRejection', (error) => {
    log.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    log.error('Uncaught exception:', error);
    process.exit(1);
});

export default client;

// Export database config for use in other files
export { dbConfig };

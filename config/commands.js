import { WHEELS } from './wheels.js';
import { ApplicationCommandType, ApplicationCommandOptionType } from 'discord.js';

// Basic commands without options
const BASIC_COMMANDS = {
    REGISTER: { name: 'register', description: 'Register into the ranking.' },
    LIST: { name: 'list', description: 'List all registered users.' },
    HELP: { name: 'help', description: 'Display all available commands and their descriptions.' },
    VIEWTIMERS: { name: 'viewtimers', description: 'View all active ticket deletion timers.' }
};

// Ticket related commands
const TICKET_COMMANDS = {
    MAKE: { name: 'maketicket', description: 'Create a ticket for support.' },
    CLOSE: { name: 'closeticket', description: 'Close the current ticket.' },
    DELETE: { name: 'deleteticket', description: 'Delete the current ticket.' },
    ENABLE: { name: 'enabletickets', description: 'Enable ticket moderation commands for this server.' },
    DISABLE: { name: 'disabletickets', description: 'Disable ticket moderation commands for this server.' }
};

// Moderation command options
const MOD_OPTIONS = {
    USER: {
        name: 'user',
        type: ApplicationCommandOptionType.User,
        description: 'The user to target.',
        required: true
    },
    REASON: {
        name: 'reason',
        type: ApplicationCommandOptionType.String,
        description: 'Reason for the action.',
        required: false
    }
};

// Admin command choices
const ADMIN_CHOICES = {
    ACTIONS: [
        { name: 'Backup Database', value: 'backup' },
        { name: 'Optimize Database', value: 'optimize' },
        { name: 'Reset User Stats', value: 'reset' },
        { name: 'Purge Old Data', value: 'purge' },
        { name: 'View Stats', value: 'stats' },
        { name: 'Generate Key', value: 'genkey' },
        { name: 'Delete Key', value: 'delkey' },
        { name: 'List Keys', value: 'listkeys' }
    ],
    KEY_TYPES: [
        { name: 'VIP', value: 'vip' },
        { name: 'Premium', value: 'premium' },
        { name: 'Basic', value: 'basic' }
    ],
    CATEGORIES: [
        { name: 'Users', value: 'users' },
        { name: 'Tickets', value: 'tickets' },
        { name: 'Logs', value: 'logs' },
        { name: 'Settings', value: 'settings' }
    ]
};

// Economy commands configuration
const ECONOMY_CONFIG = {
    RARITIES: [
        { name: 'All Items', value: 'all' },
        { name: 'Common', value: 'common' },
        { name: 'Uncommon', value: 'uncommon' },
        { name: 'Rare', value: 'rare' },
        { name: 'Epic', value: 'epic' }
    ],
    WHEELS: Object.entries(WHEELS).map(([key, wheel]) => ({
        name: wheel.name,
        value: key
    }))
};

// Construct final commands array
export const commands = [
    // Basic Commands
    ...Object.values(BASIC_COMMANDS),

    // Ticket Commands
    ...Object.values(TICKET_COMMANDS),

    // Moderation Commands
    {
        name: 'kick',
        description: 'Kick a user from the server.',
        options: [MOD_OPTIONS.USER]
    },
    {
        name: 'ban',
        description: 'Ban a user from the server.',
        options: [MOD_OPTIONS.USER, MOD_OPTIONS.REASON]
    },
    {
        name: 'mute',
        description: 'Mute a user in the server.',
        options: [MOD_OPTIONS.USER]
    },

    // Admin Command
    {
        name: 'admin',
        description: 'Admin commands for database management',
        options: [
            {
                name: 'action',
                type: ApplicationCommandOptionType.String,
                description: 'The admin action to perform',
                required: true,
                choices: ADMIN_CHOICES.ACTIONS
            },
            {
                name: 'key_type',
                type: ApplicationCommandOptionType.String,
                description: 'Type of key to generate',
                required: false,
                choices: ADMIN_CHOICES.KEY_TYPES
            },
            // ... other admin options
        ]
    },

    // Economy Commands
    {
        name: 'catalog',
        description: 'Browse the item catalog',
        options: [{
            name: 'category',
            type: ApplicationCommandOptionType.String,
            description: 'Filter items by rarity',
            required: false,
            choices: ECONOMY_CONFIG.RARITIES
        }]
    },
    {
        name: 'wheels',
        description: 'Open the wheel spin panel',
        options: [{
            name: 'spin',
            type: ApplicationCommandOptionType.String,
            description: 'Directly spin a specific wheel',
            required: false,
            choices: ECONOMY_CONFIG.WHEELS
        }]
    },
    {
        name: 'iteminfo',
        description: 'View detailed information about an item',
        options: [
            {
                name: 'item',
                type: 3,
                description: 'The item to view information about',
                required: true,
                choices: Object.entries(ITEMS).map(([key, item]) => ({
                    name: item.name,
                    value: key
                }))
            }
        ]
    }
];

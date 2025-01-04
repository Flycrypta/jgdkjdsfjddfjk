import { SlashCommandBuilder } from '@discordjs/builders';
// Remove incorrect import
// import { coinsCommand } from './Economy/coins.js';

export const baseCommands = [
    {
        name: 'register',
        description: 'Register into the system',
        category: 'General',
        execute: async (interaction) => {
            // ... register logic
        }
    },
    {
        name: 'coins',
        description: 'Manage your coins',
        category: 'Economy',
        options: [
            {
                name: 'action',
                type: 3,
                description: 'Action to perform',
                required: true,
                choices: [
                    { name: 'Balance', value: 'balance' },
                    { name: 'Transfer', value: 'transfer' },
                    { name: 'Gift', value: 'gift' },
                    { name: 'History', value: 'history' }
                ]
            }
        ],
        execute: async (interaction) => {
           coinsLogic
        }
    },
    {
        name: 'wheel',
        description: 'Spin the wheel for rewards',
        category: 'Economy',
        options: [
            {
                name: 'type',
                type: 3,
                description: 'Type of wheel to spin',
                required: true,
                choices: [
                    { name: '🥉 Bronze', value: 'BRONZE' },
                    { name: '🥈 Silver', value: 'SILVER' },
                    { name: '🥇 Gold', value: 'GOLD' },
                    { name: '💎 Platinum', value: 'PLATINUM' }
                ]
            }
        ]
    },
    {
        name: 'car',
        description: 'Car management commands',
        category: 'Cars',
        options: [
            {
                name: 'action',
                type: 3,
                description: 'Action to perform',
                required: true,
                choices: [
                    { name: 'View', value: 'view' },
                    { name: 'Modify', value: 'modify' },
                    { name: 'Sell', value: 'sell' },
                    { name: 'Race', value: 'race' },
                    { name: 'Service', value: 'service' }
                ]
            }
        ]
    },
    {
        name: 'job',
        description: 'Job related commands',
        category: 'Jobs',
        options: [
            {
                name: 'action',
                type: 3,
                description: 'Action to perform',
                required: true,
                choices: [
                    { name: 'Work', value: 'work' },
                    { name: 'Apply', value: 'apply' },
                    { name: 'Quit', value: 'quit' },
                    { name: 'Status', value: 'status' },
                    { name: 'List', value: 'list' }
                ]
            }
        ]
    },
    {
        name: 'market',
        description: 'Access the marketplace',
        category: 'Economy',
        options: [
            {
                name: 'action',
                type: 3,
                description: 'Market action',
                required: true,
                choices: [
                    { name: 'Buy', value: 'buy' },
                    { name: 'Sell', value: 'sell' },
                    { name: 'List', value: 'list' },
                    { name: 'Search', value: 'search' }
                ]
            }
        ]
    },
    {
        name: 'inventory',
        description: 'Manage your inventory',
        category: 'Items',
        options: [
            {
                name: 'action',
                type: 3,
                description: 'Inventory action',
                required: true,
                choices: [
                    { name: 'View', value: 'view' },
                    { name: 'Use', value: 'use' },
                    { name: 'Sort', value: 'sort' },
                    { name: 'Trade', value: 'trade' }
                ]
            }
        ]
    },
    {
        name: 'bank',
        description: 'Banking system',
        category: 'Economy',
        options: [
            {
                name: 'action',
                type: 3,
                description: 'Banking action',
                required: true,
                choices: [
                    { name: 'Balance', value: 'balance' },
                    { name: 'Deposit', value: 'deposit' },
                    { name: 'Withdraw', value: 'withdraw' },
                    { name: 'Transfer', value: 'transfer' },
                    { name: 'Invest', value: 'invest' }
                ]
            }
        ]
    },
    {
        name: 'daily',
        description: 'Claim daily rewards',
        category: 'Economy'
    },
    {
        name: 'ticket',
        description: 'Ticket management',
        category: 'Support',
        options: [
            {
                name: 'action',
                type: 3,
                description: 'Ticket action',
                required: true,
                choices: [
                    { name: 'Create', value: 'create' },
                    { name: 'Close', value: 'close' },
                    { name: 'View', value: 'view' },
                    { name: 'List', value: 'list' }
                ]
            }
        ]
    },
    // Add more commands here...
];

export const adminCommands = [
    {
        name: 'admin',
        description: 'Administrative commands',
        category: 'Admin',
        options: [
            {
                name: 'action',
                type: 3,
                description: 'Admin action',
                required: true,
                choices: [
                    { name: 'Give', value: 'give' },
                    { name: 'Remove', value: 'remove' },
                    { name: 'Ban', value: 'ban' },
                    { name: 'Mute', value: 'mute' },
                    { name: 'Reset', value: 'reset' },
                    { name: 'Config', value: 'config' },
                    { name: 'Godmode', value: 'godmode' },
                    { name: 'Sync', value: 'sync' }
                ]
            }
        ]
    }
];

export const jobCategories = [
    { name: 'Mechanic', value: 'mechanic' },
    { name: 'Driver', value: 'driver' },
    { name: 'Dealer', value: 'dealer' },
    { name: 'Engineer', value: 'engineer' },
    { name: 'Office Worker', value: 'office' }
];

export const carModifications = [
    { name: 'Engine', value: 'engine' },
    { name: 'Transmission', value: 'transmission' },
    { name: 'Suspension', value: 'suspension' },
    { name: 'Brakes', value: 'brakes' },
    { name: 'Turbo', value: 'turbo' }
];

// Export command categories for help command
export const categories = [
    'General',
    'Economy',
    'Cars',
    'Jobs',
    'Items',
    'Support',
    'Admin'
];

export const commands = [
    {
        name: 'coins',
        description: 'Manage your coins',
        // ...rest of coins command configuration
    },
    // ... other commands
];

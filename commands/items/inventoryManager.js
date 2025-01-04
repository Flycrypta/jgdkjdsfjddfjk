import { SlashCommandBuilder } from 'discord.js';
import BaseCommand from '../base-command.js';
import { HOMES } from '../../data/constants.js';  // Import from a single source

export default {
    name: 'inventory',
    description: 'Manage your inventory',
    category: 'items',
    data: {
        name: 'inventory',
        description: 'Manage your inventory'
    },
    // ...existing code...
}

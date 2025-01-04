import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { dbManager } from '../../db/database.js';
import { validateDate } from '../../utils/validation.js';

const adminCommand = {
    data: new SlashCommandBuilder()
        .setName('admin')
        .setDescription('Admin commands')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('give')
                .setDescription('Give items or coins to a user')
                .addUserOption(option => option.setName('user').setDescription('The user to give to').setRequired(true))
                .addStringOption(option => 
                    option.setName('type')
                        .setDescription('What to give')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Coins', value: 'coins' },
                            { name: 'Item', value: 'item' },
                            { name: 'Car', value: 'car' }
                        ))
                .addIntegerOption(option => option.setName('amount').setDescription('Amount to give').setRequired(true))
                .addIntegerOption(option => option.setName('id').setDescription('Item/Car ID (if giving item/car)'))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove items or coins from a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to remove from')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('What to remove')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Coins', value: 'coins' },
                            { name: 'Item', value: 'item' },
                            { name: 'Car', value: 'car' }
                        ))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Amount to remove')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('id')
                        .setDescription('Item/Car ID (if removing item/car)')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Reset a user\'s data')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to reset')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('What to reset')
                        .setRequired(true)
                        .addChoices(
                            { name: 'All', value: 'all' },
                            { name: 'Inventory', value: 'inventory' },
                            { name: 'Balance', value: 'balance' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('stats')
                .setDescription('View server or user statistics')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Stats type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Server Economy', value: 'economy' },
                            { name: 'Active Users', value: 'active' },
                            { name: 'Top Items', value: 'items' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('config')
                .setDescription('Configure server settings')
                .addStringOption(option =>
                    option.setName('setting')
                        .setDescription('Setting to modify')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Starting Balance', value: 'startbal' },
                            { name: 'Daily Reward', value: 'daily' },
                            { name: 'Item Drop Rate', value: 'droprate' }
                        ))
                .addIntegerOption(option =>
                    option.setName('value')
                        .setDescription('New value')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('ban')
                .setDescription('Ban user from bot commands')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to ban')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for ban')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('logs')
                .setDescription('View bot activity logs')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Log type')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Commands', value: 'commands' },
                            { name: 'Transactions', value: 'transactions' },
                            { name: 'Errors', value: 'errors' }
                        ))
                .addIntegerOption(option =>
                    option.setName('limit')
                        .setDescription('Number of entries')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('maintenance')
                .setDescription('Toggle maintenance mode')
                .addBooleanOption(option =>
                    option.setName('enabled')
                        .setDescription('Enable/disable maintenance mode')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Maintenance message')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('wipe')
                .setDescription('Wipe inactive users')
                .addIntegerOption(option =>
                    option.setName('days')
                        .setDescription('Days of inactivity')
                        .setRequired(true))
                .addBooleanOption(option =>
                    option.setName('confirm')
                        .setDescription('Confirm wipe')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('backup')
                .setDescription('Create or restore database backup')
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('Backup action')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Create', value: 'create' },
                            { name: 'Restore', value: 'restore' }
                        ))
                .addStringOption(option =>
                    option.setName('filename')
                        .setDescription('Backup filename (for restore)')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('schedule')
                .setDescription('Schedule maintenance window')
                .addStringOption(option =>
                    option.setName('start')
                        .setDescription('Start time (ISO format)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('end')
                        .setDescription('End time (ISO format)')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Maintenance reason')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('dashboard')
                .setDescription('View admin dashboard statistics')
                .addStringOption(option =>
                    option.setName('view')
                        .setDescription('Dashboard view')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Overview', value: 'overview' },
                            { name: 'Economy', value: 'economy' },
                            { name: 'Commands', value: 'commands' },
                            { name: 'System', value: 'system' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('mute')
                .setDescription('Mute a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to mute')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('Reason for mute')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('unmute')
                .setDescription('Unmute a user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('User to unmute')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('godmode')
                .setDescription('Toggle god mode for an admin')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('The admin to toggle god mode for')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('sync')
                .setDescription('Sync various systems')
                .addStringOption(option =>
                    option.setName('system')
                        .setDescription('System to sync')
                        .setRequired(true)
                        .addChoices(
                            { name: 'Economy', value: 'economy' },
                            { name: 'Tickets', value: 'tickets' },
                            { name: 'Database', value: 'database' }
                        ))),

    execute: async (interaction) => {
        if (!await checkAdminPermissions(interaction)) return;

        // Only check rate limit if user doesn't have bypass permission
        if (!interaction.bypassRateLimit) {
            const canExecute = await dbManager.checkRateLimit(
                interaction.user.id,
                'admin',
                5,
                10
            );

            if (!canExecute) {
                await interaction.reply({
                    content: 'Command rate limit exceeded. Please wait before trying again.',
                    ephemeral: true
                });
                return;
            }
        }

        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('user');
        const type = interaction.options.getString('type');

        try {
            const handlers = {
                give: handleGive,
                remove: handleRemove,
                reset: handleReset,
                stats: handleStats,
                config: handleConfig,
                ban: handleBan,
                logs: handleLogs,
                maintenance: handleMaintenance,
                wipe: handleWipe,
                backup: handleBackup,
                schedule: handleScheduleMaintenance,
                dashboard: handleDashboard,
                mute: handleMute,
                unmute: handleUnmute,
                godmode: handleGodmode,
                sync: handleSync
            };

            await handlers[subcommand](interaction, user, type);
        } catch (error) {
            await handleError(interaction, error);
        }
    }
};

async function checkAdminPermissions(interaction) {
    const hasPermission = await dbManager.checkAdminPermission(
        interaction.user.id,
        interaction.commandName
    );

    if (!hasPermission) {
        await interaction.reply({
            content: 'You do not have permission to use this command.',
            ephemeral: true
        });
        return false;
    }

    // Check if user has rate limit bypass permission
    const bypassRateLimit = await dbManager.hasPermission(interaction.user.id, 'BYPASS_RATE_LIMIT');
    interaction.bypassRateLimit = bypassRateLimit;

    return true;
}

async function handleGive(interaction, user, type) {
    const amount = interaction.options.getInteger('amount');
    const id = interaction.options.getInteger('id');

    if ((type === 'item' || type === 'car') && !id) {
        throw new Error('ID required for items or cars');
    }

    const actions = {
        coins: async () => {
            await dbManager.updateCoins(user.id, amount);
            return `Given ${amount} coins to ${user.tag}`;
        },
        item: async () => {
            await dbManager.addItemToInventory(user.id, id, amount);
            return `Given ${amount}x item (ID: ${id}) to ${user.tag}`;
        },
        car: async () => {
            await dbManager.addItemToInventory(user.id, id, amount);
            return `Given ${amount}x car (ID: ${id}) to ${user.tag}`;
        }
    };

    const message = await actions[type]();
    await interaction.reply({ content: message, ephemeral: true });
}

async function handleRemove(interaction, user, type) {
    const amount = interaction.options.getInteger('amount');
    const id = interaction.options.getInteger('id');

    switch (type) {
        case 'coins':
            await dbManager.updateCoins(user.id, -amount);
            await interaction.reply({
                content: `Removed ${amount} coins from ${user.tag}`,
                ephemeral: true
            });
            break;
        case 'item':
        case 'car':
            if (!id) {
                return interaction.reply({
                    content: 'You must provide an ID when removing items or cars.',
                    ephemeral: true
                });
            }
            await dbManager.removeItem(user.id, id, amount);
            await interaction.reply({
                content: `Removed ${amount}x ${type} (ID: ${id}) from ${user.tag}`,
                ephemeral: true
            });
            break;
    }
}

async function handleReset(interaction, user, type) {
    switch (type) {
        case 'all':
            await dbManager.resetUser(user.id);
            break;
        case 'inventory':
            await dbManager.resetInventory(user.id);
            break;
        case 'balance':
            await dbManager.resetBalance(user.id);
            break;
    }

    await interaction.reply({
        content: `Reset ${type} for ${user.tag}`,
        ephemeral: true
    });
}

async function handleStats(interaction, user, type) {
    const stats = {
        economy: async () => await dbManager.getServerEconomyStats(),
        active: async () => await dbManager.getActiveUserStats(),
        items: async () => await dbManager.getTopItemsStats()
    };

    const result = await stats[type]();
    await interaction.reply({
        content: `${type.toUpperCase()} Stats:\n${JSON.stringify(result, null, 2)}`,
        ephemeral: true
    });
}

async function handleConfig(interaction) {
    const setting = interaction.options.getString('setting');
    const value = interaction.options.getInteger('value');
    
    await dbManager.updateServerConfig(setting, value);
    await interaction.reply({
        content: `Updated ${setting} to ${value}`,
        ephemeral: true
    });
}

async function handleBan(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';
    
    await dbManager.banUserFromBot(user.id, reason);
    await interaction.reply({
        content: `Banned ${user.tag} from using bot commands. Reason: ${reason}`,
        ephemeral: true
    });
}

async function handleLogs(interaction) {
    const type = interaction.options.getString('type');
    const limit = interaction.options.getInteger('limit') || 10;
    
    const logs = await dbManager.getLogs(type, limit);
    await interaction.reply({
        content: `Last ${limit} ${type} logs:\n${JSON.stringify(logs, null, 2)}`,
        ephemeral: true
    });
}

async function handleMaintenance(interaction) {
    const enabled = interaction.options.getBoolean('enabled');
    const message = interaction.options.getString('message') || 'Bot is under maintenance';
    
    await dbManager.setMaintenanceMode(enabled, message);
    await interaction.reply({
        content: `Maintenance mode ${enabled ? 'enabled' : 'disabled'}: ${message}`,
        ephemeral: true
    });
}

async function handleWipe(interaction) {
    const days = interaction.options.getInteger('days');
    const confirm = interaction.options.getBoolean('confirm');
    
    if (!confirm) {
        return interaction.reply({
            content: 'You must confirm the wipe operation',
            ephemeral: true
        });
    }
    
    const wipedCount = await dbManager.wipeInactiveUsers(days);
    await interaction.reply({
        content: `Wiped ${wipedCount} inactive users (${days} days inactive)`,
        ephemeral: true
    });
}

async function handleBackup(interaction) {
    const action = interaction.options.getString('action');
    const filename = interaction.options.getString('filename');

    try {
        if (action === 'create') {
            // Add backup metadata
            const metadata = {
                createdBy: interaction.user.id,
                timestamp: new Date().toISOString(),
                checksum: '', // Will be filled by createBackup
                version: '1.0'
            };

            const backupFile = await dbManager.createBackup(metadata);
            
            // Clean up old backups (keep last 5)
            await dbManager.cleanupOldBackups(5);

            await interaction.reply({
                content: `Backup created successfully!\nFilename: ${backupFile}\nChecksum: ${metadata.checksum}`,
                ephemeral: true
            });
        } else if (action === 'restore') {
            if (!filename) {
                throw new Error('Filename required for restore');
            }

            // Validate backup file
            const isValid = await dbManager.validateBackup(filename);
            if (!isValid) {
                throw new Error('Invalid or corrupted backup file');
            }

            // Require additional confirmation
            await interaction.reply({
                content: 'Are you sure you want to restore this backup? This will override current data.',
                components: [/* Add confirmation buttons */],
                ephemeral: true
            });
        }
    } catch (error) {
        await handleError(interaction, error);
    }
}

// Improved maintenance scheduling with validation
async function handleScheduleMaintenance(interaction) {
    const start = interaction.options.getString('start');
    const end = interaction.options.getString('end');
    const reason = interaction.options.getString('reason') || 'Scheduled maintenance';

    try {
        // Validate dates
        if (!validateDate(start) || !validateDate(end)) {
            throw new Error('Invalid date format. Use ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)');
        }

        const startDate = new Date(start);
        const endDate = new Date(end);

        // Additional validations
        if (startDate < new Date()) {
            throw new Error('Start time must be in the future');
        }
        if (endDate <= startDate) {
            throw new Error('End time must be after start time');
        }
        if ((endDate - startDate) > (24 * 60 * 60 * 1000)) {
            throw new Error('Maintenance window cannot exceed 24 hours');
        }

        await dbManager.scheduleMaintenanceWindow(startDate, endDate, reason, interaction.user.id);
        await interaction.reply({
            content: `Maintenance scheduled:\nStart: ${startDate.toISOString()}\nEnd: ${endDate.toISOString()}\nReason: ${reason}`,
            ephemeral: true
        });
    } catch (error) {
        await handleError(interaction, error);
    }
}

// New dashboard command handler
async function handleDashboard(interaction) {
    const view = interaction.options.getString('view');
    
    try {
        const stats = await dbManager.getAdminDashboardStats(view);
        const formatted = formatDashboardView(stats, view);
        
        await interaction.reply({
            embeds: [formatted],
            ephemeral: true
        });
    } catch (error) {
        await handleError(interaction, error);
    }
}

function formatDashboardView(stats, view) {
    // Create Discord embed based on view type
    const embed = {
        title: `Admin Dashboard - ${view.charAt(0).toUpperCase() + view.slice(1)}`,
        color: 0x0099FF,
        fields: [],
        timestamp: new Date()
    };

    switch (view) {
        case 'overview':
            embed.fields = [
                { name: 'Total Users', value: stats.totalUsers.toString(), inline: true },
                { name: 'Active Today', value: stats.activeToday.toString(), inline: true },
                { name: 'Total Commands', value: stats.totalCommands.toString(), inline: true }
            ];
            break;
        // Add other view formats...
    }

    return embed;
}

async function handleMute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    await dbManager.muteUser(user.id, reason);
    await interaction.reply({
        content: `Muted ${user.tag}. Reason: ${reason}`,
        ephemeral: true
    });
}

async function handleUnmute(interaction) {
    const user = interaction.options.getUser('user');

    await dbManager.unmuteUser(user.id);
    await interaction.reply({
        content: `Unmuted ${user.tag}.`,
        ephemeral: true
    });
}

async function handleGodmode(interaction) {
    const target = interaction.options.getUser('target');
    const isEnabled = await dbManager.toggleGodmode(target.id);
    await interaction.reply({
        content: `God mode ${isEnabled ? 'enabled' : 'disabled'} for ${target.tag}.`,
        ephemeral: true
    });
}

async function handleSync(interaction) {
    const system = interaction.options.getString('system');
    await dbManager.syncSystem(system);
    await interaction.reply({
        content: `System ${system} synced successfully.`,
        ephemeral: true
    });
}

async function handleError(interaction, error) {
    console.error('Admin command error:', error);
    const errorMessage = error.message === 'ID required for items or cars' 
        ? 'You must provide an ID when giving/removing items or cars.'
        : 'An error occurred while executing the command.';
    
    await interaction.reply({
        content: errorMessage,
        ephemeral: true
    });
}

export default adminCommand;

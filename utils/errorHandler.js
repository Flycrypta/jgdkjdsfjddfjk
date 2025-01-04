import { EmbedBuilder } from 'discord.js';
import { log } from './logger.js';
import { Logger } from './logger.js';

/**
 * A custom error class that extends the built-in Error class and adds additional properties.
 *
 * @class
 */
export class BotError extends Error {
    /**
     * Create a new instance of BotError.
     *
     * @param {string} message - The error message.
     * @param {string} code - The error code.
     * @param {object} context - Additional context information about the error.
     */
    constructor(message, code, context = {}) {
        super(message);
        this.name = 'BotError';
        this.code = code;
        this.context = context;
        this.timestamp = new Date();
    }
}

// Export error codes and types for use in other parts of the application
export const ErrorCodes = {
    COMMAND_FAILED: 'CMD_001',
    INVALID_STRUCTURE: 'CMD_002',
    LOADING_ERROR: 'CMD_003',
    EXECUTION_ERROR: 'CMD_004',
    PERMISSION_DENIED: 'CMD_005',
    DATABASE_ERROR: 'CMD_006',
    INVALID_INPUT: 'CMD_007',
    RATE_LIMITED: 'CMD_008'
};

export const ErrorTypes = {
    DATABASE: 'DatabaseError',
    VALIDATION: 'ValidationError',
    PERMISSION: 'PermissionError',
    RATE_LIMIT: 'RateLimitError',
    NOT_FOUND: 'NotFoundError',
    DISCORD_API: 'DiscordAPIError'
};

export class ErrorHandler {
    constructor() {
        this.logger = new Logger('ErrorHandler');
    }

    handle(error, context = '') {
        this.logger.error(`${context}: ${error.message}`, error);
        
        // Log stack trace in development
        if (process.env.NODE_ENV === 'development') {
            console.error(error.stack);
        }
    }

    handleCommand(error, command) {
        this.handle(error, `Command error in ${command}`);
    }

    handleDatabase(error) {
        this.handle(error, 'Database error');
    }

    static async handle(interaction, error, errorCode = ErrorCodes.COMMAND_FAILED) {
        console.error(`Error ${errorCode}:`, error);
        
        const errorMessages = {
            [ErrorCodes.COMMAND_FAILED]: 'An error occurred while executing the command.',
            [ErrorCodes.INVALID_STRUCTURE]: 'Invalid command structure.',
            [ErrorCodes.LOADING_ERROR]: 'Command failed to load.',
            [ErrorCodes.EXECUTION_ERROR]: 'Command execution failed.',
            [ErrorCodes.PERMISSION_DENIED]: 'You do not have permission to use this command.',
            [ErrorCodes.DATABASE_ERROR]: 'A database error occurred.',
            [ErrorCodes.INVALID_INPUT]: 'Invalid input provided.',
            [ErrorCodes.RATE_LIMITED]: 'You are being rate limited.'
        };

        const message = `${errorMessages[errorCode]} (Error Code: ${errorCode})`;
        
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply({ content: message, ephemeral: true });
        } else {
            await interaction.reply({ content: message, ephemeral: true });
        }
    }

    static async handle(error, interaction, client, silent = false) {
        try {
            const errorId = Date.now().toString(36);

            // Log error details
            log.error({
                errorId,
                name: error.name,
                message: error.message,
                stack: error.stack,
                user: interaction?.user?.id,
                command: interaction?.commandName
            });

            if (!silent) {
                const embed = new EmbedBuilder()
                    .setColor(0xFF0000)
                    .setTitle('❌ Error')
                    .setDescription(this.getErrorMessage(error));

                if (process.env.NODE_ENV === 'development') {
                    embed.addFields({ name: 'Error ID', value: errorId });
                }

                try {
                    if (interaction?.deferred) {
                        await interaction.editReply({ embeds: [embed], ephemeral: true });
                    } else if (interaction?.replied) {
                        await interaction.followUp({ embeds: [embed], ephemeral: true });
                    } else if (interaction) {
                        await interaction.reply({ embeds: [embed], ephemeral: true });
                    }
                } catch (replyError) {
                    log.error('Failed to send error message:', replyError);
                }
            }

            // Alert admins for serious errors
            if (this.isSeriousError(error) && client) {
                await this.alertAdmins(error, client, errorId);
            }
        } catch (handlerError) {
            console.error('Error handling error:', handlerError);
        }
    }

    static logErrorDetails(error) {
        console.error('Error Details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    }

    static getErrorMessage(error) {
        // Customize error messages based on error type
        if (error instanceof ValidationError) {
            return error.message;
        } else if (error instanceof DatabaseError) {
            return 'A database error occurred.';
        } else if (error.name === 'DiscordAPIError') {
            return 'A Discord API error occurred.';
        } else {
            return 'An unexpected error occurred. Please try again later.';
        }
    }

    static isSeriousError(error) {
        return error.name === 'DatabaseError' || 
               error.name === 'DiscordAPIError' ||
               error.stack?.includes('UnhandledPromiseRejection');
    }

    static async alertAdmins(error, client, errorId) {
        const adminChannelId = process.env.ERROR_LOG_CHANNEL;
        if (!adminChannelId) return;

        const channel = await client.channels.fetch(adminChannelId);
        if (!channel) return;

        const embed = new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('🚨 Serious Error')
            .setDescription(`Error ID: ${errorId}\n${error.message}`)
            .addFields(
                { name: 'Name', value: error.name },
                { name: 'Stack', value: error.stack || 'No stack trace available' }
            )
            .setTimestamp();

        await channel.send({ embeds: [embed] });
    }
}

export const errorHandler = new ErrorHandler();

// Custom error classes
export class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}

export class DatabaseError extends Error {
    constructor(message, code, details = {}) {
        super(message);
        this.name = 'DatabaseError';
        this.code = code;
        this.details = details;
    }
}

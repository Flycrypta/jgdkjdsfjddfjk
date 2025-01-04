import winston from 'winston';
import { LoggingService } from './LoggingService.js';
import { ValidationHandler } from './ValidationHandler.js';

export class ErrorTypes {
    static DATABASE = 'DatabaseError';
    static VALIDATION = 'ValidationError';
    static PERMISSION = 'PermissionError';
    static COOLDOWN = 'CooldownError';
    static RACE = 'RaceError';
    static ECONOMY = 'EconomyError';
    static NETWORK = 'NetworkError';
}

export class ErrorHandler {
    constructor() {
        this.logger = new LoggingService();
        this.validator = new ValidationHandler();
    }

    static handle(error, interaction) {
        const handler = new ErrorHandler();
        return handler._handleError(error, interaction);
    }

    async _handleError(error, interaction) {
        const errorContext = this._getErrorContext(error, interaction);
        await this.logger.logError(errorContext);

        if (interaction?.deferred) {
            return this._sendErrorResponse(interaction, errorContext);
        }

        return this._formatErrorResponse(errorContext);
    }

    _getErrorContext(error, interaction) {
        return {
            type: error.name || ErrorTypes.DATABASE,
            message: error.message,
            stack: error.stack,
            code: error.code,
            timestamp: new Date(),
            user: interaction?.user?.id,
            guild: interaction?.guild?.id,
            command: interaction?.commandName,
            metadata: {
                options: interaction?.options?._hoistedOptions,
                path: error.path,
                details: error.details
            }
        };
    }

    async _sendErrorResponse(interaction, errorContext) {
        const response = this._formatErrorResponse(errorContext);
        
        try {
            await interaction.editReply({
                content: response.userMessage,
                ephemeral: true
            });
        } catch (e) {
            this.logger.logError({
                type: ErrorTypes.NETWORK,
                message: 'Failed to send error response',
                error: e
            });
        }
    }

    _formatErrorResponse(errorContext) {
        const responses = {
            [ErrorTypes.DATABASE]: {
                userMessage: '❌ Database error occurred. Please try again later.',
                logLevel: 'error'
            },
            [ErrorTypes.VALIDATION]: {
                userMessage: '❌ Invalid input provided.',
                logLevel: 'warn'
            },
            [ErrorTypes.PERMISSION]: {
                userMessage: '❌ You don\'t have permission for this.',
                logLevel: 'warn'
            },
            [ErrorTypes.COOLDOWN]: {
                userMessage: '⏳ Please wait before trying again.',
                logLevel: 'info'
            },
            [ErrorTypes.RACE]: {
                userMessage: '🏁 Race system error occurred.',
                logLevel: 'error'
            },
            [ErrorTypes.ECONOMY]: {
                userMessage: '💰 Economy system error occurred.',
                logLevel: 'error'
            },
            [ErrorTypes.NETWORK]: {
                userMessage: '🌐 Network error occurred.',
                logLevel: 'error'
            }
        };

        return {
            ...responses[errorContext.type] || responses[ErrorTypes.DATABASE],
            errorId: this._generateErrorId(),
            context: errorContext
        };
    }

    _generateErrorId() {
        return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}

import winston from 'winston';
import { STATUS_EMOJIS } from './constants.js';
import { TextChannel } from 'discord.js';

// Logging utility template

export class Logger {
    constructor(context) {
        this.context = context;
        this.logger = winston.createLogger({
            format: winston.format.printf(({ level, message }) => {
                const timestamp = new Date().toISOString();
                const emoji = this.getEmoji(level);
                return `[${timestamp}] [${this.context}] [${level.toUpperCase()}]: ${emoji} ${message}`;
            }),
            transports: [new winston.transports.Console()]
        });
    }

    getEmoji(level) {
        switch (level) {
            case 'info': return STATUS_EMOJIS.INFO;
            case 'error': return STATUS_EMOJIS.ERROR;
            case 'warn': return STATUS_EMOJIS.WARNING;
            default: return STATUS_EMOJIS.INFO;
        }
    }

    info(message) {
        this.logger.info(message);
    }

    warn(message, error) {
        this.logger.warn(message);
    }

    error(message, error) {
        this.logger.error(`${message} ${error?.message || ''}`);
    }
}

export const log = (message, type = 'info') => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] [${type}] ${message}`);
};

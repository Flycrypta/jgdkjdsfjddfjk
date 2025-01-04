import { SlashCommandBuilder } from '@discordjs/builders';
import { Logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/errorHandler.js';

export default class BaseCommand {
    constructor() {
        this.data = new SlashCommandBuilder();
        this.logger = new Logger(this.constructor.name);
        this.category = 'General';
        this.cooldown = 0;
    }

    async execute(interaction) {
        throw new Error('Command execute method not implemented');
    }

    async handleError(interaction, error) {
        await ErrorHandler.handle(error, interaction);
    }
}

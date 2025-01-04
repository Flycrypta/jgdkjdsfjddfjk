import BaseCommand from './base-command.js';

export default class CommandName extends BaseCommand {
    constructor() {
        super();
        this.data
            .setName('command-name')
            .setDescription('Command description');
        this.category = 'Category';
        this.cooldown = 0; // Optional cooldown in seconds
    }

    async execute(interaction) {
        try {
            // Command logic here
        } catch (error) {
            await this.handleError(interaction, error);
        }
    }
}

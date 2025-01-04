export class BaseCommand {
    constructor() {
        this.data = null;
        this.category = '';
        this.permissions = [];
        this.cooldown = 3;
    }

    async execute(interaction) {
        throw new Error('Command execute method not implemented');
    }

    async handleError(interaction, error) {
        // Error handling logic
    }
}

export default BaseCommand; // Add default export

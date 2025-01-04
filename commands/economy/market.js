import BaseCommand from '../base-command.js';
import { dbManager } from '../../db/database.js';
import { Activity } from '../../utils/activity.js';

export default class MarketCommand extends BaseCommand {
    constructor() {
        super();
        this.data
            .setName('market')
            .setDescription('Access the marketplace')
            .addSubcommand(subcommand =>
                subcommand
                    .setName('buy')
                    .setDescription('Buy an item')
                    .addStringOption(option =>
                        option.setName('id')
                            .setDescription('Item ID')
                            .setRequired(true)))
            .addSubcommand(subcommand =>
                subcommand
                    .setName('browse')
                    .setDescription('Browse available cars'))
            this.category = 'Economy';
            this.cooldown = 5;
    }

    async execute(interaction) {
        try {
            const subcommand = interaction.options.getSubcommand();
            const activity = new Activity(interaction.client);
            activity.setActivity('Shopping');

            switch (subcommand) {
                case 'buy':
                    await this.handleBuy(interaction);
                    break;
                case 'browse':
                    await this.handleBrowse(interaction);
                    break;
            }
        } catch (error) {
            await this.handleError(interaction, error);
        }
    }

    async handleBuy(interaction) {
        const car = interaction.options.getString('car');
        await buyCar(interaction, car);
    }

    async handleBrowse(interaction) {
        await browseCars(interaction);
    }
}

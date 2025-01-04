import { BankingSystem } from './BankingSystem.js';
import { MarketSystem } from './MarketSystem.js';

export class SystemManager {
    constructor(client) {
        this.client = client;
        this.systems = new Map();
    }

    async initialize() {
        // Initialize only essential core systems
        await this.initializeCore();
        this.initialized = true;
    }

    async initializeCore() {
        // Only initialize essential systems
        this.systems.set('banking', new BankingSystem(this.client.dbManager));
        this.systems.set('market', new MarketSystem(this.client.dbManager));
    }

    getSystem(name) {
        if (!this.initialized) {
            throw new Error('Systems not initialized');
        }
        return this.systems.get(name);
    }
}

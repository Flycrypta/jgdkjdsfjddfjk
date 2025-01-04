import { readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export class FeatureManager {
    constructor(client) {
        this.client = client;
        this.features = new Map();
    }

    async loadFeatures() {
        try {
            const featuresPath = join(__dirname, 'modules');
            const featureFiles = readdirSync(featuresPath).filter(file => file.endsWith('.js'));

            for (const file of featureFiles) {
                const filePath = `file://${join(featuresPath, file)}`;
                const feature = await import(filePath);

                if (feature.default && typeof feature.default.initialize === 'function') {
                    const featureInstance = new feature.default(this.client);
                    await featureInstance.initialize();
                    this.features.set(feature.default.name, featureInstance);
                }
            }

            console.log(`Loaded ${this.features.size} features`);
        } catch (error) {
            console.error('Error loading features:', error);
            throw error;
        }
    }

    getFeature(name) {
        return this.features.get(name);
    }

    async enableFeature(name) {
        const feature = this.getFeature(name);
        if (feature && typeof feature.enable === 'function') {
            await feature.enable();
        }
    }

    async disableFeature(name) {
        const feature = this.getFeature(name);
        if (feature && typeof feature.disable === 'function') {
            await feature.disable();
        }
    }
}

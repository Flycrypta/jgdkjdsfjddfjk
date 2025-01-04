import { EventEmitter } from 'events';
import { CAR_MODS } from '../utils/index.js';

export class ModificationSystem extends EventEmitter {
    constructor(dbManager) {
        super();
        this.dbManager = dbManager;
    }

    async installMod(userId, carId, modId) {
        return await this.dbManager.transaction(async () => {
            // Get car and mod details
            const car = await this.dbManager.getUserCar(userId, carId);
            const mod = await this.dbManager.getMod(modId);

            if (!car || !mod) {
                throw new Error('Invalid car or modification');
            }

            // Check compatibility
            if (!this.isModCompatible(car, mod)) {
                throw new Error('Modification not compatible with this car');
            }

            // Check if car has space for more mods
            if (!this.hasModSpace(car)) {
                throw new Error('Car has reached maximum modifications');
            }

            // Apply modification
            const stats = this.calculateModStats(car, mod);
            await this.dbManager.addCarModification(carId, {
                modId,
                installDate: new Date(),
                stats
            });

            // Update car stats
            await this.dbManager.updateCarStats(carId, stats);

            this.emit('modInstalled', {
                userId,
                carId,
                modId,
                stats
            });

            return stats;
        });
    }

    isModCompatible(car, mod) {
        return mod.compatibility.includes('all') || 
               mod.compatibility.includes(car.region);
    }

    hasModSpace(car) {
        const currentMods = car.mods?.length || 0;
        return currentMods < 5; // Maximum 5 mods per car
    }

    calculateModStats(car, mod) {
        const stats = { ...car.stats };
        
        if (mod.hpGain) {
            stats.horsepower += mod.hpGain;
        }
        if (mod.handling) {
            stats.handling += mod.handling;
        }
        if (mod.acceleration) {
            stats.acceleration += mod.acceleration;
        }

        // Apply synergy bonuses for compatible mod combinations
        const synergyBonus = this.calculateSynergyBonus(car.mods, mod);
        Object.keys(synergyBonus).forEach(stat => {
            stats[stat] = (stats[stat] || 0) + synergyBonus[stat];
        });

        return stats;
    }

    calculateSynergyBonus(existingMods, newMod) {
        const bonuses = {};
        
        if (!existingMods) return bonuses;

        // Check for complementary modifications
        const hasComplement = existingMods.some(mod => 
            this.areModsComplementary(mod, newMod)
        );

        if (hasComplement) {
            bonuses.horsepower = Math.floor(newMod.hpGain * 0.1);
            bonuses.handling = Math.floor(newMod.handling * 0.1);
        }

        return bonuses;
    }

    areModsComplementary(mod1, mod2) {
        // Define complementary mod pairs
        const complementaryPairs = {
            'turbocharger': ['intercooler', 'ecu'],
            'suspension': ['brakes', 'tires'],
            'exhaust': ['intake', 'ecu']
        };

        return complementaryPairs[mod1.type]?.includes(mod2.type) ||
               complementaryPairs[mod2.type]?.includes(mod1.type);
    }

    async uninstallMod(userId, carId, modId) {
        return await this.dbManager.transaction(async () => {
            const car = await this.dbManager.getUserCar(userId, carId);
            if (!car) throw new Error('Car not found');

            const mod = car.mods.find(m => m.id === modId);
            if (!mod) throw new Error('Modification not found on car');

            // Revert car stats
            const revertedStats = this.revertModStats(car, mod);
            await this.dbManager.updateCarStats(carId, revertedStats);
            await this.dbManager.removeCarModification(carId, modId);

            this.emit('modUninstalled', {
                userId,
                carId,
                modId
            });

            return revertedStats;
        });
    }

    revertModStats(car, mod) {
        const stats = { ...car.stats };
        
        if (mod.hpGain) stats.horsepower -= mod.hpGain;
        if (mod.handling) stats.handling -= mod.handling;
        if (mod.acceleration) stats.acceleration -= mod.acceleration;

        // Remove synergy bonuses
        const synergyBonus = this.calculateSynergyBonus(
            car.mods.filter(m => m.id !== mod.id),
            mod
        );
        
        Object.keys(synergyBonus).forEach(stat => {
            stats[stat] = (stats[stat] || 0) - synergyBonus[stat];
        });

        return stats;
    }

    async purchaseAndInstallMod(userId, carId, modId) {
        return await this.dbManager.transaction(async () => {
            // First check market price and availability
            const listing = await this.marketSystem.getModListing(modId);
            if (!listing) {
                throw new Error('Modification not available in market');
            }

            // Purchase through market system
            const purchase = await this.marketSystem.purchaseListing(
                userId, 
                listing.id,
                1
            );

            // Install the mod
            const result = await this.installMod(userId, carId, modId);

            // Track installation for career progression
            if (this.careerSystem) {
                await this.careerSystem.handleModInstallation(
                    userId,
                    modId,
                    result.stats
                );
            }

            return result;
        });
    }
}

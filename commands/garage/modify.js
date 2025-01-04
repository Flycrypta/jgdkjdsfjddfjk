class Modification {
    constructor(name, performanceImpact) {
        this.name = name;
        this.performanceImpact = performanceImpact;
        this.requirements = new Map();
    }

    addRequirement(partName, level) {
        this.requirements.set(partName, level);
    }
}

class ModificationSystem {
    constructor() {
        this.availableModifications = [];
    }

    addModification(mod) {
        this.availableModifications.push(mod);
    }

    getApplicableModifications(carParts) {
        return this.availableModifications.filter(mod => 
            Array.from(mod.requirements.entries()).every(([key, value]) => 
                carParts.has(key) && carParts.get(key) >= value
            )
        );
    }

    calculateTotalPerformanceImpact(appliedMods) {
        return appliedMods.reduce((sum, mod) => sum + mod.performanceImpact, 0);
    }
}

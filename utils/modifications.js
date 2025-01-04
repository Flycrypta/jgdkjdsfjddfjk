const MODIFICATIONS = {
    engine: {
        stock: { cost: 0, stats: {} },
        turbo: {
            cost: 15000,
            stats: { acceleration: 20, topSpeed: 15 }
        },
        supercharger: {
            cost: 20000,
            stats: { acceleration: 25, topSpeed: 20 }
        }
    },
    suspension: {
        stock: { cost: 0, stats: {} },
        sport: {
            cost: 8000,
            stats: { handling: 15, braking: 10 }
        },
        racing: {
            cost: 12000,
            stats: { handling: 25, braking: 15 }
        }
    },
    // Add more modification types
};

const applyModification = async (car, modType, modName) => {
    if (!MODIFICATIONS[modType]?.[modName]) {
        throw new Error('Invalid modification');
    }

    const mod = MODIFICATIONS[modType][modName];
    car.modifications.push({
        type: modType,
        name: modName,
        stats: mod.stats,
        installed: new Date()
    });

    return car;
};

module.exports = { MODIFICATIONS, applyModification };

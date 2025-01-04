const TUNING_LIMITS = {
    gearRatios: {
        min: 2.0,
        max: 5.0
    },
    suspension: {
        height: { min: -50, max: 50 },
        damping: { min: 1, max: 10 },
        stiffness: { min: 1, max: 10 }
    },
    alignment: {
        camber: { min: -5, max: 5 },
        toe: { min: -2, max: 2 }
    }
};

const calculateTuningEffect = (car, track) => {
    const basePerformance = car.stats;
    const tuningMultipliers = {
        handling: 1.0,
        acceleration: 1.0,
        topSpeed: 1.0,
        braking: 1.0
    };

    // Apply gear ratio effects
    if (car.tuning.gearRatios) {
        tuningMultipliers.acceleration *= calculateGearEffect(car.tuning.gearRatios);
    }

    // Apply suspension effects
    if (car.tuning.suspension) {
        const suspensionEffect = calculateSuspensionEffect(car.tuning.suspension, track);
        tuningMultipliers.handling *= suspensionEffect;
    }

    return tuningMultipliers;
};

module.exports = { TUNING_LIMITS, calculateTuningEffect };

const calculateRepairCost = (car) => {
    const baseCost = car.value * 0.05;
    const damageMultiplier = (100 - car.condition) / 100;
    return Math.floor(baseCost * damageMultiplier);
};

module.exports = { calculateRepairCost };

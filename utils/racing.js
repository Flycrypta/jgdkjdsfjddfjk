const calculateRaceResult = (car1, car2, raceType) => {
    const types = {
        drag: { acceleration: 0.4, topSpeed: 0.4, handling: 0.1, braking: 0.1 },
        circuit: { acceleration: 0.25, topSpeed: 0.25, handling: 0.3, braking: 0.2 },
        drift: { acceleration: 0.2, topSpeed: 0.1, handling: 0.5, braking: 0.2 }
    };

    const weights = types[raceType];
    const car1Score = calculateScore(car1, weights);
    const car2Score = calculateScore(car2, weights);
    
    return {
        winner: car1Score > car2Score ? car1 : car2,
        scores: { car1: car1Score, car2: car2Score }
    };
};

const calculateScore = (car, weights) => {
    let score = 0;
    for (const [stat, weight] of Object.entries(weights)) {
        score += (car.stats[stat] + getModificationBonus(car, stat)) * weight;
    }
    return score * (car.condition / 100);
};

module.exports = { calculateRaceResult };

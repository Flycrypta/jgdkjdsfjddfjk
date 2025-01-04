const WEATHER_CONDITIONS = {
    clear: {
        grip: 1.0,
        visibility: 1.0,
        temperature: { min: 15, max: 30 }
    },
    rainy: {
        grip: 0.7,
        visibility: 0.8,
        temperature: { min: 5, max: 20 },
        puddleFormation: true
    },
    snow: {
        grip: 0.4,
        visibility: 0.6,
        temperature: { min: -10, max: 2 },
        snowAccumulation: true
    },
    foggy: {
        grip: 0.9,
        visibility: 0.5,
        temperature: { min: 0, max: 15 }
    },
    storm: {
        grip: 0.5,
        visibility: 0.3,
        temperature: { min: 5, max: 25 },
        lightning: true
    }
};

const calculateWeatherEffect = (car, weather, track) => {
    try {
        const condition = WEATHER_CONDITIONS[weather];
        const tireType = car.modifications.find(m => m.type === 'tires')?.name || 'stock';
        
        return {
            grip: condition.grip * getTireWeatherMultiplier(tireType, weather),
            visibility: condition.visibility,
            temperature: Math.random() * (condition.temperature.max - condition.temperature.min) + condition.temperature.min
        };
    } catch (error) {
        console.error('Error calculating weather effect:', error);
        return null;
    }
};

module.exports = { WEATHER_CONDITIONS, calculateWeatherEffect };

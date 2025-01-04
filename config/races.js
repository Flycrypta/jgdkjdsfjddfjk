export const RACE_CONFIGS = {
    sprint: {
        minPlayers: 2,
        maxPlayers: 4,
        baseReward: 1000,
        xpReward: 100,
        timeLimitSeconds: 30,
        requirements: {
            minLevel: 1,
            minCarValue: 5000
        }
    },
    circuit: {
        minPlayers: 3,
        maxPlayers: 8,
        baseReward: 2500,
        xpReward: 250,
        timeLimitSeconds: 60,
        requirements: {
            minLevel: 5,
            minCarValue: 15000
        }
    },
    drift: {
        minPlayers: 2,
        maxPlayers: 4,
        baseReward: 1500,
        xpReward: 150,
        timeLimitSeconds: 45,
        requirements: {
            minLevel: 3,
            minCarValue: 10000
        }
    }
};

export const TRACK_MODIFIERS = {
    weather: {
        rain: { grip: 0.7, visibility: 0.8 },
        snow: { grip: 0.5, visibility: 0.6 },
        sunny: { grip: 1.0, visibility: 1.0 }
    },
    surface: {
        asphalt: { grip: 1.0 },
        dirt: { grip: 0.8 },
        gravel: { grip: 0.7 }
    }
};

// ...racing system constants...

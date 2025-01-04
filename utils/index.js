import { default as Discord } from 'discord.js';
const { Client } = Discord;
import { Collection } from '@discordjs/collection';
import winston from 'winston';

const WHEEL_ITEMS = [
    { id: 1, name: 'Common Box', rarity: 'common', value: 100 },
    { id: 2, name: 'Rare Box', rarity: 'rare', value: 250 },
    { id: 3, name: 'Epic Box', rarity: 'epic', value: 500 },
    { id: 4, name: 'Legendary Box', rarity: 'legendary', value: 1000 },
    { id: 5, name: 'Mythic Box', rarity: 'mythic', value: 2000 }
];

const CAR_BRANDS = {
    JAPANESE: ['Toyota', 'Honda', 'Nissan', 'Mazda', 'Subaru', 'Mitsubishi', 'Lexus', 'Infiniti'],
    GERMAN: ['BMW', 'Mercedes-Benz', 'Audi', 'Porsche', 'Volkswagen'],
    AMERICAN: ['Ford', 'Chevrolet', 'Dodge', 'Jeep', 'Tesla', 'Cadillac'],
    ITALIAN: ['Ferrari', 'Lamborghini', 'Maserati', 'Alfa Romeo', 'Fiat'],
    BRITISH: ['Aston Martin', 'Jaguar', 'Land Rover', 'McLaren', 'Bentley']
};

const CAR_MODS = {
    Engine: {
        Turbocharger: [
            { id: 1, brand: 'Garrett', value: 3000, hpGain: 70, compatibility: ['all'] },
            { id: 2, brand: 'HKS', value: 3500, hpGain: 80, compatibility: CAR_BRANDS.JAPANESE },
            { id: 3, brand: 'Borgwarner', value: 4000, hpGain: 90, compatibility: ['all'] }
        ],
        Supercharger: [
            { id: 4, brand: 'Vortech', value: 4500, hpGain: 100, compatibility: CAR_BRANDS.AMERICAN },
            { id: 5, brand: 'Rotrex', value: 5000, hpGain: 110, compatibility: CAR_BRANDS.GERMAN },
            { id: 6, brand: 'Whipple', value: 5500, hpGain: 120, compatibility: CAR_BRANDS.AMERICAN }
        ],
        ECU: [
            { id: 7, brand: 'COBB', value: 1000, hpGain: 25, compatibility: ['all'] },
            { id: 8, brand: 'APR', value: 1200, hpGain: 30, compatibility: CAR_BRANDS.GERMAN }
        ]
    },
    Exhaust: {
        Headers: [
            { id: 9, brand: 'Borla', value: 1000, hpGain: 15, compatibility: ['all'] },
            { id: 10, brand: 'Akrapovic', value: 1500, hpGain: 20, compatibility: CAR_BRANDS.GERMAN }
        ],
        Catback: [
            { id: 11, brand: 'Magnaflow', value: 800, hpGain: 10, compatibility: ['all'] },
            { id: 12, brand: 'Remus', value: 1200, hpGain: 12, compatibility: CAR_BRANDS.GERMAN }
        ],
        Downpipe: [
            { id: 13, brand: 'Injen', value: 600, hpGain: 8, compatibility: CAR_BRANDS.JAPANESE },
            { id: 14, brand: 'Milltek', value: 900, hpGain: 10, compatibility: CAR_BRANDS.GERMAN }
        ]
    },
    Suspension: {
        Coilovers: [
            { id: 15, brand: 'KW', value: 2000, handling: 30, compatibility: ['all'] },
            { id: 16, brand: 'Ohlins', value: 2500, handling: 35, compatibility: CAR_BRANDS.GERMAN }
        ],
        Springs: [
            { id: 17, brand: 'Eibach', value: 500, handling: 15, compatibility: ['all'] },
            { id: 18, brand: 'H&R', value: 600, handling: 18, compatibility: CAR_BRANDS.GERMAN }
        ]

    },
    BMW: {
        Turbocharger: [
            { id: 19, brand: 'Pure Turbos', value: 5000, hpGain: 150, compatibility: ['BMW'] },
            { id: 20, brand: 'Dinan', value: 4500, hpGain: 130, compatibility: ['BMW'] }
        ],
        Supercharger: [
            { id: 21, brand: 'VF Engineering', value: 6000, hpGain: 200, compatibility: ['BMW'] },
            { id: 22, brand: 'ESS Tuning', value: 5500, hpGain: 180, compatibility: ['BMW'] }
        ],
        ECU: [
            { id: 23, brand: 'Bootmod3', value: 1200, hpGain: 50, compatibility: ['BMW'] },
            { id: 24, brand: 'JB4', value: 1000, hpGain: 40, compatibility: ['BMW'] }
        ],
        Exhaust: [
            { id: 25, brand: 'Akrapovic', value: 3000, hpGain: 25, compatibility: ['BMW'] },
            { id: 26, brand: 'Armytrix', value: 2800, hpGain: 20, compatibility: ['BMW'] }
        ],
        Suspension: [
            { id: 27, brand: 'Bilstein', value: 2500, handling: 40, compatibility: ['BMW'] },
            { id: 28, brand: 'KW', value: 2700, handling: 45, compatibility: ['BMW'] }
        ]
    }
};

const CARS = [
    // Japanese Cars
    {
        id: 1,
        name: 'Toyota Supra MK4',
        make: 'Toyota',
        model: 'Supra',
        year: 1993,
        base_hp: 320,
        value: 80000,
        rarity: 'legendary',
        region: 'JAPANESE',
        mods: CAR_MODS
    },
    {
        id: 2,
        name: 'Nissan Skyline GT-R R34',
        make: 'Nissan',
        model: 'Skyline GT-R',
        year: 1999,
        base_hp: 280,
        value: 120000,
        rarity: 'legendary',
        region: 'JAPANESE',
        mods: CAR_MODS
    },
    // German Cars
    {
        id: 3,
        name: 'BMW M3 E46',
        make: 'BMW',
        model: 'M3',
        year: 2005,
        base_hp: 333,
        value: 45000,
        rarity: 'epic',
        region: 'GERMAN',
        mods: CAR_MODS
    },
    {
        id: 4,
        name: 'Porsche 911 GT3',
        make: 'Porsche',
        model: '911 GT3',
        year: 2022,
        base_hp: 502,
        value: 170000,
        rarity: 'legendary',
        region: 'GERMAN',
        mods: CAR_MODS
    },
    {
        id: 5,
        name: 'BMW M5 F90',
        make: 'BMW',
        model: 'M5',
        year: 2021,
        base_hp: 600,
        value: 102000,
        rarity: 'legendary',
        region: 'GERMAN',
        mods: CAR_MODS.BMW
    },
    {
        id: 6,
        name: 'BMW M4 G82',
        make: 'BMW',
        model: 'M4',
        year: 2021,
        base_hp: 503,
        value: 72000,
        rarity: 'epic',
        region: 'GERMAN',
        mods: CAR_MODS.BMW
    },
    {
        id: 7,
        name: 'BMW M2 Competition',
        make: 'BMW',
        model: 'M2',
        year: 2020,
        base_hp: 405,
        value: 58000,
        rarity: 'epic',
        region: 'GERMAN',
        mods: CAR_MODS.BMW
    },
    // American Cars
    {
        id: 8,
        name: 'Ford Mustang GT500',
        make: 'Ford',
        model: 'Mustang',
        year: 2023,
        base_hp: 760,
        value: 80000,
        rarity: 'epic',
        region: 'AMERICAN',
        mods: CAR_MODS
    }
    // Add more cars following the same pattern...
];

const WHEEL_TYPES = {
    BRONZE: {
        cost: 100,
        minReward: 50,
        maxReward: 200,
        gemChance: 0.01,
        itemPool: WHEEL_ITEMS.filter(item => item.rarity === 'common')
    },
    SILVER: {
        cost: 250,
        minReward: 125,
        maxReward: 500,
        gemChance: 0.05,
        itemPool: WHEEL_ITEMS.filter(item => ['common', 'rare'].includes(item.rarity))
    },
    GOLD: {
        cost: 500,
        minReward: 250,
        maxReward: 1000,
        gemChance: 0.10,
        itemPool: WHEEL_ITEMS.filter(item => ['rare', 'epic'].includes(item.rarity))
    },
    PLATINUM: {
        cost: 1000,
        minReward: 500,
        maxReward: 2000,
        gemChance: 0.15,
        itemPool: WHEEL_ITEMS.filter(item => ['epic', 'legendary'].includes(item.rarity))
    },


};

const ACHIEVEMENTS = {
    CAR_COLLECTOR: {
        id: 'car_collector',
        name: 'Car Collector',
        description: 'Collect {goal} different cars',
        tiers: [
            { goal: 5, reward: 1000 },
            { goal: 10, reward: 2500 },
            { goal: 25, reward: 10000 }
        ]
    },
    RACE_WINNER: {
        id: 'race_winner',
        name: 'Race Winner',
        description: 'Win {goal} races',
        tiers: [
            { goal: 10, reward: 500 },
            { goal: 50, reward: 2500 },
            { goal: 100, reward: 5000 }
        ]
    }
    // Add more achievements...
};

// Single export of MECHANICS
const MECHANICS = {
    MAX_GARAGE_SIZE: 10,
    BASE_RACE_REWARD: 100,
    WIN_STREAK_MULTIPLIER: 0.1,
    DAILY_REWARD_BASE: 100,
    MAX_MODS_PER_CAR: 5
};

// Create collections
const Collections = {
    Cars: new Collection(CARS.map(car => [car.id, car])),
    Mods: new Collection(Object.values(CAR_MODS).flatMap(category => 
        Object.values(category).flatMap(mods => mods)
    ).map(mod => [mod.id, mod])),
    Achievements: new Collection(Object.entries(ACHIEVEMENTS).map(([id, achievement]) => [id, achievement]))
};

// Export utility functions and classes
import { ErrorHandler } from './errorHandler.js';
import { Logger } from './logger.js';
import { dbManager } from '../db/database.js';
import { setBotActivity } from './startupChecks.js';

class AdvancedErrorHandler extends ErrorHandler {
    constructor() {
        super();
        this.errorLog = new Map();
    }

    logError(error, context = {}) {
        const timestamp = new Date().toISOString();
        const errorEntry = {
            timestamp,
            error: error.message,
            stack: error.stack,
            context
        };
        this.errorLog.set(timestamp, errorEntry);
        super.handleError(error);
    }

    getErrorLog() {
        return Array.from(this.errorLog.values());
    }

    clearErrorLog() {
        this.errorLog.clear();
    }
}

const advancedErrorHandler = new AdvancedErrorHandler();

// Utility functions
function safeJsonParse(jsonString) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        advancedErrorHandler.logError(error, { action: 'JSON parsing', input: jsonString });
        return null;
    }
}

function retryOperation(operation, maxRetries = 3, delay = 1000) {
    return new Promise((resolve, reject) => {
        let attempts = 0;

        const attempt = () => {
            attempts++;
            operation()
                .then(resolve)
                .catch((error) => {
                    if (attempts >= maxRetries) {
                        advancedErrorHandler.logError(error, { action: 'Retry operation', attempts });
                        reject(error);
                    } else {
                        setTimeout(attempt, delay);
                    }
                });
        };

        attempt();
    });
}

function validateInput(input, schema) {
    try {
        const errors = [];
        for (const [key, rules] of Object.entries(schema)) {
            if (rules.required && (input[key] === undefined || input[key] === null)) {
                errors.push(`${key} is required`);
            } else if (input[key] !== undefined) {
                if (rules.type && typeof input[key] !== rules.type) {
                    errors.push(`${key} must be of type ${rules.type}`);
                }
                if (rules.min !== undefined && input[key] < rules.min) {
                    errors.push(`${key} must be at least ${rules.min}`);
                }
                if (rules.max !== undefined && input[key] > rules.max) {
                    errors.push(`${key} must be at most ${rules.max}`);
                }
            }
        }
        return errors;
    } catch (error) {
        advancedErrorHandler.logError(error, { action: 'Input validation', input, schema });
        return [error.message];
    }
}

const generateUniqueId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const formatCurrency = (amount) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

function calculateWinProbability(playerCar, opponentCar) {
    const playerScore = playerCar.base_hp + (playerCar.mods?.reduce((sum, mod) => sum + mod.hpGain, 0) || 0);
    const opponentScore = opponentCar.base_hp + (opponentCar.mods?.reduce((sum, mod) => sum + mod.hpGain, 0) || 0);
    return playerScore / (playerScore + opponentScore);
}

const getLuxuryItems = () => getCategoryItems('LUXURY_ITEMS');

const client = new Client({ 
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages
    ]
});

client.setActivity('Racing Cars', { type: 'PLAYING' }).catch(error => {
    advancedErrorHandler.logError(error, { action: 'Setting bot activity' });
});

client.login(process.env.BOT_TOKEN).catch(error => {
    advancedErrorHandler.logError(error, { action: 'Bot login' });
});

// Race System
const RACE_TYPES = {
    DRAG: {
        name: 'Drag Race',
        minBet: 100,
        maxBet: 10000,
        hpWeight: 0.7,
        handlingWeight: 0.3,
        rewards: {
            win: 1.8,  // Multiplier for winning
            lose: 0
        }
    },
    CIRCUIT: {
        name: 'Circuit Race',
        minBet: 200,
        maxBet: 20000,
        hpWeight: 0.5,
        handlingWeight: 0.5,
        rewards: {
            win: 2.0,
            lose: 0
        }
    },
    DRIFT: {
        name: 'Drift Competition',
        minBet: 300,
        maxBet: 30000,
        hpWeight: 0.3,
        handlingWeight: 0.7,
        rewards: {
            win: 2.2,
            lose: 0
        }
    }
};

// Car Upgrade System
function upgradeCar(car, mod) {
    try {
        if (!isModCompatible(car, mod)) {
            throw new Error('Mod is not compatible with this car');
        }

        const currentMods = car.installedMods || [];
        if (currentMods.length >= MECHANICS.MAX_MODS_PER_CAR) {
            throw new Error('Maximum number of mods reached');
        }

        return {
            ...car,
            installedMods: [...currentMods, mod],
            base_hp: car.base_hp + (mod.hpGain || 0),
            handling: (car.handling || 0) + (mod.handling || 0)
        };
    } catch (error) {
        advancedErrorHandler.logError(error, { action: 'Car upgrade', car, mod });
        throw error;
    }
}

// Economy System
const ECONOMY = {
    async addBalance(userId, amount) {
        try {
            const user = await dbManager.getUser(userId);
            const newBalance = (user.balance || 0) + amount;
            await dbManager.updateUser(userId, { balance: newBalance });
            return newBalance;
        } catch (error) {
            advancedErrorHandler.logError(error, { action: 'Add balance', userId, amount });
            throw error;
        }
    },

    async removeBalance(userId, amount) {
        try {
            const user = await dbManager.getUser(userId);
            if ((user.balance || 0) < amount) {
                throw new Error('Insufficient funds');
            }
            const newBalance = user.balance - amount;
            await dbManager.updateUser(userId, { balance: newBalance });
            return newBalance;
        } catch (error) {
            advancedErrorHandler.logError(error, { action: 'Remove balance', userId, amount });
            throw error;
        }
    }
};

// Race Handler
async function handleRace(player1Id, player2Id, car1, car2, raceType, bet) {
    try {
        const race = RACE_TYPES[raceType];
        if (!race) throw new Error('Invalid race type');
        if (bet < race.minBet || bet > race.maxBet) throw new Error('Invalid bet amount');

        const car1Score = calculateCarScore(car1, race);
        const car2Score = calculateCarScore(car2, race);
        
        const random = Math.random();
        const player1WinProbability = car1Score / (car1Score + car2Score);
        
        const winner = random < player1WinProbability ? player1Id : player2Id;
        const loser = winner === player1Id ? player2Id : player2Id;
        
        await ECONOMY.removeBalance(loser, bet);
        await ECONOMY.addBalance(winner, bet * race.rewards.win);

        return {
            winner,
            winnings: bet * race.rewards.win,
            car1Score,
            car2Score
        };
    } catch (error) {
        advancedErrorHandler.logError(error, { action: 'Race handling', player1Id, player2Id, raceType, bet });
        throw error;
    }
}

// Helper functions
function calculateCarScore(car, raceType) {
    const baseScore = (car.base_hp * raceType.hpWeight) + ((car.handling || 0) * raceType.handlingWeight);
    const modBonus = (car.installedMods || []).reduce((sum, mod) => {
        return sum + ((mod.hpGain || 0) * raceType.hpWeight) + ((mod.handling || 0) * raceType.handlingWeight);
    }, 0);
    return baseScore + modBonus;
}

function isModCompatible(car, mod) {
    return mod.compatibility.includes('all') || 
           mod.compatibility.includes(car.make) || 
           mod.compatibility.includes(car.region);
}

// Export additional functionality
export {
    RACE_TYPES,
    ECONOMY,
    upgradeCar,
    handleRace,
    calculateCarScore,
    Collections,
    MECHANICS,
    WHEEL_TYPES,
    ACHIEVEMENTS,
    CAR_BRANDS,
    CAR_MODS,
    CARS,
    WHEEL_ITEMS,
    advancedErrorHandler,
    safeJsonParse,
    retryOperation,
    validateInput,
    generateUniqueId,
    formatCurrency,
    calculateWinProbability,
    getLuxuryItems
};

export function setActivity(client, activity) {
    if (client.user) {
        client.user.setActivity(activity);
    }
}






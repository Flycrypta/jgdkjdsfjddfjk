import { Collection } from 'discord.js';

// Game items and configurations
export const WHEEL_ITEMS = [
    // ...existing code...
];

export const CAR_BRANDS = {
    // ...existing code...
};

export const CAR_MODS = {
    // ...existing code...
};

export const CARS = [
    // ...existing code...
];

export const WHEEL_TYPES = {
    // ...existing code...
};

export const ACHIEVEMENTS = {
    // ...existing code...
};

export const MECHANICS = {
    MAX_GARAGE_SIZE: 10,
    BASE_RACE_REWARD: 100,
    WIN_STREAK_MULTIPLIER: 0.1,
    DAILY_REWARD_BASE: 100,
    MAX_MODS_PER_CAR: 5
};

export const HOMES = {
    STARTER: { id: 'starter', name: 'Starter Home', price: 50000 },
    MEDIUM: { id: 'medium', name: 'Medium Home', price: 150000 },
    LUXURY: { id: 'luxury', name: 'Luxury Home', price: 500000 }
};

export const ACTIVITIES = {
    RACING: '🏎️ Racing Cars',
    TRADING: '💰 Trading Cars',
    IDLE: '🎮 Playing'
};

// Game Collections
export const Collections = {
    Cars: new Collection(CARS.map(car => [car.id, car])),
    Mods: new Collection(
        Object.values(CAR_MODS)
            .flatMap(category => Object.values(category).flatMap(mods => mods))
            .map(mod => [mod.id, mod])
    ),
    Achievements: new Collection(
        Object.entries(ACHIEVEMENTS).map(([id, achievement]) => [id, achievement])
    )
};

// Console status emojis
export const STATUS_EMOJIS = {
    SUCCESS: '✅',
    ERROR: '❌',
    WARNING: '⚠️',
    INFO: 'ℹ️',
    LOADING: '⏳',
    DATABASE: '🗄️',
    COMMAND: '🔧',
    BOT: '🤖',
    RACE: '🏎️',
    MONEY: '💰',
    CAR: '🚗',
    HOME: '🏠',
    ACHIEVEMENT: '🏆'
};

// Export everything as a group for compatibility
export const CONSTANTS = {
    WHEEL_ITEMS,
    CAR_BRANDS,
    CAR_MODS,
    CARS,
    WHEEL_TYPES,
    ACHIEVEMENTS,
    MECHANICS,
    HOMES,
    ACTIVITIES,
    Collections,
    STATUS_EMOJIS
};

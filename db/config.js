import { config } from 'dotenv';

config();

export const DB_CONFIG = {
    client: 'better-sqlite3',
    connection: {
        filename: './data/bot.db'
    },
    useNullAsDefault: true
};

export const MYSQL_CONFIG = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

export const REQUIRED_TABLES = [
    'users',
    'items',
    'inventory',
    'wheel_spins'
];

export const TABLE_SCHEMAS = {
    users: ['user_id', 'username', 'coins'],
    items: ['id', 'name', 'type'],
    inventory: ['user_id', 'item_id', 'quantity'],
    wheel_spins: ['id', 'user_id', 'wheel_id']
};

export const MARKET_CONFIG = {
    listingDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
    maxActiveListings: 10,
    feePercentage: 0.05
};

export const BUSINESS_CONFIG = {
    maxEmployees: 10,
    incomeInterval: 3600000, // 1 hour
    upgradeMultiplier: 1.5
};

export const PROPERTY_CONFIG = {
    maxProperties: 5,
    rentInterval: 24 * 60 * 60 * 1000, // 24 hours
    taxInterval: 7 * 24 * 60 * 60 * 1000 // 7 days
};

export const INVESTMENT_CONFIG = {
    maxStocks: 10,
    updateInterval: 300000, // 5 minutes
    maxVolatility: 0.15
};

export const JOB_CONFIG = {
    maxLevel: 50,
    experienceMultiplier: 1.2,
    bonusThreshold: 0.95
};

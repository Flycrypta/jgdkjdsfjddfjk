import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { Logger } from '../utils/logger.js';
import { EventEmitter } from 'events';
import Decimal from 'decimal.js';
import { DB_CONFIG, REQUIRED_TABLES, TABLE_SCHEMAS } from './config.js';
import { resolveDBPath, resolveRootPath, pathToFileURL } from '../utils/paths.js';
import { DatabaseError, DatabaseErrorCodes } from './db/errors/DatabaseError.js';

const log = new Logger('DatabaseManager');

const db = new Database(pathToFileURL('./botData.db').href, DB_CONFIG);

const userAssets = new Map();

function initializeUser(userId) {
    if (!userAssets.has(userId)) {
        userAssets.set(userId, {
            balance: 1000,
            stocks: {},
            crypto: {},
            businesses: [],
            job: null,
            loans: [],
            transactions: [],
            creditScore: 700,
            savingsGoals: [],
            vipLevel: 'standard'
        });
    }
    return userAssets.get(userId);
}

async function updateBalance(userId, amount) {
    const user = initializeUser(userId);
    user.balance += amount;
    return user.balance;
}

async function addTransaction(userId, type, amount) {
    const user = initializeUser(userId);
    const transaction = {
        id: Date.now(),
        type,
        amount,
        timestamp: new Date().toISOString()
    };
    user.transactions.push(transaction);
    return transaction;
}

async function getUserAssets(userId) {
    return initializeUser(userId);
}

class DatabaseManager extends EventEmitter {
    constructor() {
        super();
        this.transactionQueue = new TransactionQueue();
        this.allItems = [];
        this.allCars = [];
        this.initializationPromise = this.initialize();
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            try {
                // Use better-sqlite3 instead of sqlite3
                this.db = new Database(pathToFileURL('./botData.db').href, DB_CONFIG);
                
                this.db.exec(`
                    -- Server tracking
                    CREATE TABLE IF NOT EXISTS servers (
                        server_id TEXT PRIMARY KEY,
                        join_date TEXT,
                        member_count INTEGER,
                        last_activity TEXT
                    )
                `);
                
                resolve();
            } catch (error) {
                reject(error);
            }
        });
    }

    async initialize() {
        try {
            const dbPath = pathToFileURL(resolveDBPath('bot.db')).href;
            const schemaPath = pathToFileURL(resolveRootPath('db', 'schema.sql')).href;

            // Ensure data directory exists
            await fs.promises.mkdir(resolveDBPath(), { recursive: true });

            this.db = new Database(dbPath, DB_CONFIG);

            // Execute schema
            const schema = await fs.promises.readFile(schemaPath, 'utf8');
            this.db.exec(schema);

            // Verify tables
            this.verifyTables();

            // Prepare statements
            await this.prepareStatements();

            log.info('✅ Database initialized successfully');
            return true;
        } catch (error) {
            const dbError = new DatabaseError(
                'Database initialization failed',
                DatabaseErrorCodes.CONNECTION_ERROR,
                { 
                    originalError: error.message,
                    dbPath: this.dbPath,
                    stackTrace: error.stack
                }
            );
            log.error(dbError);
            throw dbError;
        }
    }
}

export const dbManager = new DatabaseManager();

const bankingQueries = {
    getAssets: db.prepare('SELECT * FROM user_assets WHERE user_id = ?'),
    updateBalance: db.prepare('UPDATE user_assets SET balance = balance + ? WHERE user_id = ?'),
    addStock: db.prepare('INSERT INTO stocks (user_id, stock_name, shares, purchase_price, purchase_date) VALUES (?, ?, ?, ?, ?)'),
    addBusiness: db.prepare('INSERT INTO businesses (user_id, business_type, purchase_date) VALUES (?, ?, ?)'),
    addTransaction: db.prepare('INSERT INTO transactions (user_id, type, amount, timestamp) VALUES (?, ?, ?, ?)'),
    setCooldown: db.prepare('INSERT OR REPLACE INTO cooldowns (user_id, command, last_used) VALUES (?, ?, ?)')
};

const tradeQueries = {
    createTrade: db.prepare('INSERT INTO trades (initiator_id, target_id, items_offered, items_requested, status, timestamp) VALUES (?, ?, ?, ?, ?, ?)'),
    getPendingTrades: db.prepare('SELECT * FROM trades WHERE (initiator_id = ? OR target_id = ?) AND status = "pending"'),
    updateTradeStatus: db.prepare('UPDATE trades SET status = ? WHERE trade_id = ?')
};

const database = {
    cars: [
        { id: 32, brand: 'Toyota', model: 'Corolla', hp: 100, weight: 1500, vin: generateVin(), image: 'toyota_corolla.png' },
        { id: 33, brand: 'Honda', model: 'Civic', hp: 150, weight: 1400, vin: generateVin(), image: 'honda_civic.png' },
        { id: 34, brand: 'Ford', model: 'Mustang', hp: 200, weight: 1300, vin: generateVin(), image: 'ford_mustang.png' },
        { id: 35, brand: 'Chevrolet', model: 'Camaro', hp: 300, weight: 1200, vin: generateVin(), image: 'chevrolet_camaro.png' },
        { id: 36, brand: 'Tesla', model: 'Model S', hp: 400, weight: 1100, vin: generateVin(), image: 'tesla_model_s.png' },
        { id: 37, brand: 'Ferrari', model: '488', hp: 500, weight: 1000, vin: generateVin(), image: 'ferrari_488.png' }
    ],
    homes: [
        { id: 26, name: 'Small Apartment', price: 10000, size: 'small', type: 'apartment', rarity: 'common', image: 'small_apartment.png' },
        { id: 27, name: 'Medium Apartment', price: 20000, size: 'medium', type: 'apartment', rarity: 'uncommon', image: 'medium_apartment.png' },
        { id: 28, name: 'Large Apartment', price: 50000, size: 'large', type: 'apartment', rarity: 'rare', image: 'large_apartment.png' },
        { id: 29, name: 'Small House', price: 100000, size: 'small', type: 'house', rarity: 'epic', image: 'small_house.png' },
        { id: 30, name: 'Medium House', price: 200000, size: 'medium', type: 'house', rarity: 'legendary', image: 'medium_house.png' },
        { id: 31, name: 'Large House', price: 500000, size: 'large', type: 'house', rarity: 'mythic', image: 'large_house.png' }
    ],
    jobs: [
        { id: 1, name: 'Farmer', salary: 3000 },
        { id: 2, name: 'Engineer', salary: 5000 },
        { id: 3, name: 'Doctor', salary: 7000 },
        { id: 4, name: 'Teacher', salary: 4000 },
        { id: 5, name: 'Artist', salary: 3500 }
    ]
};

function generateVin() {
    return 'VIN' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

export {
    updateBalance,
    addTransaction,
    getUserAssets,
    bankingQueries,
    database,
    tradeQueries
};

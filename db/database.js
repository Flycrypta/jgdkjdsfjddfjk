import Database from 'better-sqlite3';
import fs from 'fs/promises';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { Logger } from '../utils/logger.js';
import { QueueManager } from './managers/QueueManager.js';
import { DatabaseError } from './errors/DatabaseError.js';
import { DB_CONFIG } from './config.js';
import { EventEmitter } from 'events';
import { TransactionQueue } from './managers/TransactionQueue.js';
import mysql from 'mysql2/promise';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const log = new Logger('DatabaseManager');

const dbPath = path.join(__dirname, '..', 'data', 'bot.db');

const db = new Database(dbPath, DB_CONFIG);

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

const DatabaseErrorCodes = {
    CONNECTION_ERROR: 'CONNECTION_ERROR',
    QUERY_ERROR: 'QUERY_ERROR',
    INITIALIZATION_ERROR: 'INITIALIZATION_ERROR',
    TRANSACTION_ERROR: 'TRANSACTION_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR'
};

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
                this.db = new Database(dbPath, DB_CONFIG);
                
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
            this.db = new Database('./data/bot.db', {
                verbose: process.env.DEBUG_MODE === 'true' ? console.log : null
            });

            // Enable WAL mode for better performance
            this.db.pragma('journal_mode = WAL');
            
            // Create tables if they don't exist
            this.db.exec(`
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    username TEXT NOT NULL,
                    coins INTEGER DEFAULT 0,
                    last_daily DATETIME,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS cars (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    owner_id TEXT,
                    model TEXT NOT NULL,
                    value INTEGER NOT NULL,
                    modifications TEXT,
                    FOREIGN KEY(owner_id) REFERENCES users(id)
                );
            `);

            // Prepare common statements
            this.statements = {
                getUser: this.db.prepare('SELECT * FROM users WHERE id = ?'),
                updateCoins: this.db.prepare('UPDATE users SET coins = coins + ? WHERE id = ?'),
                addCar: this.db.prepare('INSERT INTO cars (owner_id, model, value) VALUES (?, ?, ?)')
            };

            log.info('Database initialized successfully');
        } catch (error) {
            throw new DatabaseError('Failed to initialize database', { cause: error });
        }
    }

    // User methods
    async getUser(userId) {
        return this.statements.getUser.get(userId);
    }

    async updateCoins(userId, amount) {
        return this.statements.updateCoins.run(amount, userId);
    }

    // Car methods
    async addCarToUser(userId, carModel, value) {
        return this.statements.addCar.run(userId, carModel, value);
    }

    verifyTables() {
        for (const table of REQUIRED_TABLES) {
            const result = this.db.prepare(`
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name=?
            `).get(table);

            if (!result) {
                throw new Error(`Required table '${table}' does not exist`);
            }

            // Verify columns
            const columns = TABLE_SCHEMAS[table];
            if (columns) {
                const tableInfo = this.db.prepare(`PRAGMA table_info(${table})`).all();
                const columnNames = tableInfo.map(col => col.name);
                
                for (const required of columns) {
                    if (!columnNames.includes(required)) {
                        throw new Error(`Required column '${required}' missing from table '${table}'`);
                    }
                }
            }
        }
    }

    async initializeDatabaseWithRetry(maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                await this.initializeDatabase();
                return;
            } catch (error) {
                if (attempt === maxRetries) throw error;
                log.warn(`Database initialization attempt ${attempt} failed, retrying...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    setupAutomaticBackup() {
        const backupInterval = 1000 * 60 * 60; // Every hour
        setInterval(() => {
            try {
                const backupPath = resolveRootPath('backups', `bot-${Date.now()}.db`);
                this.db.backup(backupPath)
                    .then(() => log.info(`Database backed up to ${backupPath}`))
                    .catch(err => this.logError('Backup failed', err));
            } catch (error) {
                this.logError('Backup error', error);
            }
        }, backupInterval);
    }

    async initializeDatabase() {
        const tables = [
            // Core tables
            `CREATE TABLE IF NOT EXISTS users (
                user_id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                coins INTEGER DEFAULT 0 CHECK (coins >= 0),
                gems INTEGER DEFAULT 0 CHECK (gems >= 0),
                xp INTEGER DEFAULT 0,
                level INTEGER DEFAULT 1,
                last_daily TIMESTAMP,
                streak_count INTEGER DEFAULT 0,
                bonus_multiplier REAL DEFAULT 1.0,
                total_claims INTEGER DEFAULT 0,
                highest_streak INTEGER DEFAULT 0,
                next_reward_time TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                settings JSON,
                godmode BOOLEAN DEFAULT FALSE,  -- Add godmode column
                last_work_time TIMESTAMP,  -- Add last_work_time column
                CONSTRAINT valid_multiplier CHECK (bonus_multiplier >= 1.0)
            )`,

            `CREATE TABLE IF NOT EXISTS inventory (
                user_id TEXT,
                item_id INTEGER,
                quantity INTEGER DEFAULT 0,
                vin TEXT UNIQUE,  -- Add VIN column
                purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Add purchase date column
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, item_id),
                FOREIGN KEY (user_id) REFERENCES users(user_id),
                FOREIGN KEY (item_id) REFERENCES items(id)
            )`,

            `CREATE TABLE IF NOT EXISTS items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                price INTEGER DEFAULT 0 CHECK (price >= 0),
                brand TEXT,
                model TEXT,
                material TEXT,
                carat REAL CHECK (carat > 0 OR carat IS NULL),
                horsepower INTEGER CHECK (horsepower > 0 OR horsepower IS NULL),
                torque INTEGER CHECK (torque > 0 OR torque IS NULL),
                unobtainable INTEGER DEFAULT 0,
                rarity TEXT DEFAULT 'common',
                properties JSON,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(name, type)
            )`,

            `CREATE TABLE IF NOT EXISTS elo_ratings (
                user_id TEXT PRIMARY KEY,
                elo INTEGER DEFAULT 1000,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )`,

            `CREATE TABLE IF NOT EXISTS spin_usage (
                user_id TEXT PRIMARY KEY,
                daily_spins INTEGER DEFAULT 0,
                vip_spins INTEGER DEFAULT 0,
                last_spin_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )`,

            `CREATE TABLE IF NOT EXISTS jobs (
                job_id INTEGER PRIMARY KEY,
                name TEXT NOT NULL,
                description TEXT,
                min_payout INTEGER DEFAULT 100,
                max_payout INTEGER DEFAULT 500,
                xp_reward INTEGER DEFAULT 10
            )`
        ];

        // Execute table creation in correct order (users first, then tables with foreign keys)
        for (const table of tables) {
            try {
                this.db.exec(table);
            } catch (error) {
                this.logError(`Failed to create table: ${table.split('(')[0]}`, error);
                throw error;
            }
        }

        await this.db.exec(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                admin_id TEXT NOT NULL,
                action TEXT NOT NULL,
                target_id TEXT,
                details TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS command_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                command TEXT NOT NULL,
                status TEXT,
                error TEXT,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS rate_limits (
                user_id TEXT NOT NULL,
                command TEXT NOT NULL,
                uses INTEGER DEFAULT 1,
                reset_time TIMESTAMP,
                PRIMARY KEY (user_id, command)
            );

            CREATE TABLE IF NOT EXISTS admin_roles (
                role_id TEXT PRIMARY KEY,
                permissions TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS maintenance_schedule (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                start_time TIMESTAMP NOT NULL,
                end_time TIMESTAMP NOT NULL,
                reason TEXT,
                created_by TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS backups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                created_by TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        log.info('✅ Database tables created successfully');
    }

    async prepareStatements() {
        try {
            this.stmt = {
                // User statements
                getUser: this.db.prepare('SELECT * FROM users WHERE user_id = ?'),
                createUser: this.db.prepare('INSERT OR IGNORE INTO users (user_id, username) VALUES (?, ?)'),
                updateUser: this.db.prepare('UPDATE users SET coins = coins + ? WHERE user_id = ?'),
                
                // Item statements
                getItem: this.db.prepare('SELECT * FROM items WHERE id = ?'),
                
                // Inventory statements
                addToInventory: this.db.prepare(`
                    INSERT INTO inventory (user_id, item_id, quantity)
                    VALUES (?, ?, ?)
                    ON CONFLICT(user_id, item_id) DO UPDATE SET
                    quantity = quantity + excluded.quantity
                `),
                getInventory: this.db.prepare('SELECT * FROM inventory WHERE user_id = ?')
            };

            log.info('✅ Database statements prepared successfully');
        } catch (error) {
            this.logError('Failed to prepare database statements', error);
            throw error;
        }
    }

    async transaction(callback) {
        try {
            this.stmt.beginTransaction.run();
            const result = await callback();
            this.stmt.commit.run();
            return result;
        } catch (error) {
            this.stmt.rollback.run();
            throw error;
        }
    }

    async measurePerformance(operation, callback) {
        const start = performance.now();
        let success = false;
        try {
            const result = await callback();
            success = true;
            return result;
        } finally {
            const duration = performance.now() - start;
            this.stmt.logPerformance.run(operation, duration, success ? 1 : 0);
        }
    }

    async getCarStats(carId) {
        return this.measurePerformance('getCarStats', async () => {
            return this.db.prepare(`
                SELECT 
                    c.*,
                    COUNT(DISTINCT r.id) as total_races,
                    COUNT(DISTINCT CASE WHEN r.winner_id = c.user_id THEN r.id END) as races_won,
                    COUNT(DISTINCT m.id) as total_mods,
                    COUNT(DISTINCT s.id) as service_count
                FROM cars c
                LEFT JOIN race_participants rp ON c.id = rp.car_id
                LEFT JOIN car_races r ON rp.race_id = r.id
                LEFT JOIN car_modifications m ON c.id = m.car_id
                LEFT JOIN car_service_records s ON c.id = s.car_id
                WHERE c.id = ?
                GROUP BY c.id
            `).get(carId);
        });
    }

    async getCarValue(carId) {
        return this.transaction(async () => {
            const car = await this.getCar(carId);
            if (!car) throw new Error('Car not found');

            let baseValue = car.base_value;
            
            // Add mod values
            const mods = await this.getCarMods(carId);
            const modValue = mods.reduce((sum, mod) => sum + mod.value, 0);

            // Add performance multiplier
            const stats = await this.getCarStats(carId);
            const performanceMultiplier = 1 + (stats.races_won / Math.max(stats.total_races, 1)) * 0.5;

            return Math.floor(baseValue * performanceMultiplier + modValue);
        });
    }

    verifyDatabase() {
        if (!this.db) throw new Error('Database not initialized');
        if (!this.stmt) throw new Error('Statements not prepared');
        
        // Test a basic query
        try {
            this.db.prepare('SELECT 1').get();
            log.info('Database connection verified');
        } catch (error) {
            throw new Error('Database connection test failed');
        }
    }

    logError(message, error) {
        log.error(message, error);
        console.error(`❌ ${message}:`, {
            message: error.message,
            code: error.code,
            stack: error.stack
        });

        // Log to file using resolved path
        const logDir = resolveRootPath('logs');
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }

        const logFile = path.join(logDir, 'db-errors.log');
        const logEntry = `[${new Date().toISOString()}] ${message}\n${JSON.stringify(error, null, 2)}\n\n`;
        fs.appendFileSync(logFile, logEntry);
    }

    /**
     * Advanced wheel spin function
     * @param {string} userId 
     * @param {string} wheelType - e.g., 'normal' or 'vip'
     * @returns {object} result with type, name, and optional coinReward
     */
    spinWheel(userId, wheelType) {
        if (!this.allItems?.length || !this.allCars?.length) {
            throw new Error('Game data not initialized');
        }

        const roll = Math.random() * 100;
        let result;

        if (wheelType === 'vip') {
            // VIP has better chances
            if (roll < 40) { // 40% chance for car
                const car = this.allCars[Math.floor(Math.random() * this.allCars.length)];
                this.addToInventory(userId, car.id, 1);
                result = { type: 'car', name: car.name };
            } else { // 60% chance for items
                const item = this.allItems[Math.floor(Math.random() * this.allItems.length)];
                this.addToInventory(userId, item.id, 1);
                result = { type: 'item', name: item.name };
            }
        } else {
            // Normal spin
            if (roll < 70) { // 70% chance for coins
                const coins = Math.floor(Math.random() * 1000) + 100;
                this.stmt.updateUser.run(coins, 0, 0, userId);
                result = { type: 'coins', name: 'Coins', coinReward: coins };
            } else if (roll < 95) { // 25% chance for item
                const item = this.allItems[Math.floor(Math.random() * this.allItems.length)];
                this.addToInventory(userId, item.id, 1);
                result = { type: 'item', name: item.name };
            } else { // 5% chance for car
                const car = this.allCars[Math.floor(Math.random() * this.allCars.length)];
                this.addToInventory(userId, car.id, 1);
                result = { type: 'car', name: car.name };
            }
        }

        return result;
    }

    /**
     * Add a modification to a user's car in the inventory
     * @param {string} userId 
     * @param {number} carItemId 
     * @param {string} modName 
     */
    addCarModification(userId, carItemId, modName) {
        const carItem = this.db.prepare('SELECT * FROM items WHERE id = ? AND type = "car"').get(carItemId);
        if (!carItem) {
            throw new Error('Car item not found or is not a car.');
        }
        // Store mods in JSON properties
        const properties = carItem.properties ? JSON.parse(carItem.properties) : {};
        if (!properties.mods) {
            properties.mods = [];
        }
        properties.mods.push(modName);

        this.db.prepare('UPDATE items SET properties = json(?) WHERE id = ?')
            .run(JSON.stringify(properties), carItemId);
    }

    purchaseItem(userId, itemId, quantity) {
        const item = this.db.prepare('SELECT price FROM items WHERE id = ?').get(itemId);
        if (!item) throw new Error('Item not found.');

        // Use Decimal for cost calculations
        const cost = new Decimal(item.price).times(quantity);
        const user = this.db.prepare('SELECT coins FROM users WHERE user_id = ?').get(userId);
        if (!user || new Decimal(user.coins).lt(cost)) {
            throw new Error('Insufficient coins.');
        }

        // Deduct cost and add item to inventory
        this.db.prepare('UPDATE users SET coins = coins - ? WHERE user_id = ?')
            .run(cost.toNumber(), userId);
        this.db.prepare(`
            INSERT INTO inventory (user_id, item_id, quantity)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, item_id) DO UPDATE
            SET quantity = quantity + excluded.quantity
        `).run(userId, itemId, quantity);

        return { success: true, cost };
    }

    /**
     * Pay user for doing a job
     * @param {string} userId
     * @param {number} jobId
     */
    workJob(userId, jobId) {
        const job = this.stmt.getJob.get(jobId);
        if (!job) throw new Error('That job does not exist!');
        const payout = Math.floor(Math.random() * (job.max_payout - job.min_payout + 1)) + job.min_payout;
        // updateUser adds coins, gems, xp => adjust as needed
        this.stmt.updateUser.run(payout, 0, job.xp_reward, userId);
        return { payout, xp: job.xp_reward, jobName: job.name };
    }

    // Add new wheel spin methods
    // Add new wheel spin methods
    async recordWheelSpin(userId, reward, isVIP = false) {
        return this.db.prepare(`
            INSERT INTO wheel_spins (user_id, reward_amount, is_vip, timestamp)
            VALUES (?, ?, ?, datetime('now'))
        `).run(userId, reward, isVIP);
    }

    async getWheelSpinReward(isVIP = false) {
        const rewardTiers = this.db.prepare(`
            SELECT * FROM reward_tiers WHERE is_vip = ? ORDER BY probability DESC
        `).all(isVIP);

        const roll = Math.random();
        let cumulativeProbability = 0;

        for (const tier of rewardTiers) {
            cumulativeProbability += tier.probability;
            if (roll <= cumulativeProbability) {
                return Math.floor(Math.random() * (tier.max_amount - tier.min_amount + 1)) + tier.min_amount;
            }
        }

        // Fallback to minimum reward if no tier is selected (shouldn't happen)
        return rewardTiers[rewardTiers.length - 1].min_amount;
    }

    async performWheelSpin(userId, isVIP = false) {
        const reward = await this.getWheelSpinReward(isVIP);
        await this.recordWheelSpin(userId, reward, isVIP);

        // Update user's coins
        this.db.prepare('UPDATE users SET coins = coins + ? WHERE user_id = ?').run(reward, userId);

        // Contribute to jackpot
        const jackpotContribution = Math.floor(reward * 0.1); // 10% of reward goes to jackpot
        await this.updateJackpot(jackpotContribution);

        return { reward, jackpotContribution };
    }

    async getJackpotAmount() {
        const result = this.db.prepare('SELECT amount FROM jackpot WHERE id = 1').get();
        return result ? result.amount : 0;
    }

    async awardJackpot(userId) {
        const jackpotAmount = await this.getJackpotAmount();
        
        this.db.prepare('UPDATE users SET coins = coins + ? WHERE user_id = ?').run(jackpotAmount, userId);
        this.db.prepare('UPDATE jackpot SET amount = 1000000 WHERE id = 1').run(); // Reset jackpot

        return jackpotAmount;
    }

    async getWheelSpinStats(userId) {
        return this.db.prepare(`
            SELECT 
                COUNT(*) as total_spins,
                SUM(CASE WHEN is_vip = 1 THEN 1 ELSE 0 END) as vip_spins,
                SUM(reward_amount) as total_rewards,
                MAX(reward_amount) as highest_reward,
                AVG(reward_amount) as average_reward
            FROM wheel_spins
            WHERE user_id = ?
        `).get(userId);
    }

    getDailySpinCount(userId) {
        const result = this.db.prepare(`
            SELECT COUNT(*) as count 
            FROM wheel_spins 
            WHERE user_id = ? 
            AND timestamp > datetime('now', '-1 day')
        `).get(userId);
        return result.count;
    }

    getVIPStatus(userId) {
        return this.db.prepare('SELECT vip_tier FROM users WHERE user_id = ?').get(userId);
    }

    async updateJackpot(amount) {
        return this.db.prepare('UPDATE jackpot SET amount = amount + ?').run(amount);
    }

    getSpinHistory(userId, limit = 10) {
        return this.db.prepare(`
            SELECT reward_amount, is_vip, timestamp
            FROM wheel_spins
            WHERE user_id = ?
            ORDER BY timestamp DESC
            LIMIT ?
        `).all(userId, limit);
    }

    getUserStats(userId) {
        return this.db.prepare(`
            SELECT 
                COUNT(*) as total_spins,
                SUM(reward_amount) as total_rewards,
                MAX(reward_amount) as highest_reward
            FROM wheel_spins
            WHERE user_id = ?
        `).get(userId);
    }

    // Initialize tables for wheel system
    async initializeWheelTables() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS wheel_spins (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL,
                reward_amount INTEGER NOT NULL,
                is_vip BOOLEAN DEFAULT FALSE,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS jackpot (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                amount INTEGER DEFAULT 1000000
            );

            CREATE TABLE IF NOT EXISTS reward_tiers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                min_amount INTEGER NOT NULL,
                max_amount INTEGER NOT NULL,
                probability REAL NOT NULL,
                is_vip BOOLEAN DEFAULT FALSE
            );
        `);

        // Initialize default reward tiers if empty
        const hasRewards = this.db.prepare('SELECT COUNT(*) as count FROM reward_tiers').get();
        if (!hasRewards.count) {
            this.db.prepare(`
                INSERT INTO reward_tiers (name, min_amount, max_amount, probability, is_vip)
                VALUES 
                    ('Common', 100, 1000, 0.6, FALSE),
                    ('Rare', 1000, 5000, 0.3, FALSE),
                    ('Epic', 5000, 20000, 0.08, FALSE),
                    ('Legendary', 20000, 100000, 0.02, FALSE),
                    ('VIP Common', 200, 2000, 0.5, TRUE),
                    ('VIP Rare', 2000, 10000, 0.3, TRUE),
                    ('VIP Epic', 10000, 40000, 0.15, TRUE),
                    ('VIP Legendary', 40000, 200000, 0.05, TRUE)
            `).run();
        }
    }

    // Audit Log Methods
    async logAdminAction(adminId, action, targetId, details) {
        await this.db.run(`
            INSERT INTO audit_logs (admin_id, action, target_id, details)
            VALUES (?, ?, ?, ?)`,
            adminId, action, targetId, JSON.stringify(details)
        );
    }

    // Command Logging
    async logCommand(userId, command, status = 'success', error = null) {
        await this.db.run(`
            INSERT INTO command_logs (user_id, command, status, error)
            VALUES (?, ?, ?, ?)`,
            userId, command, status, error
        );
    }

    // Rate Limiting
    async checkRateLimit(userId, command, limit, windowMinutes) {
        const result = await this.db.get(`
            SELECT uses, reset_time FROM rate_limits
            WHERE user_id = ? AND command = ?`,
            userId, command
        );

        const now = new Date();
        if (!result || new Date(result.reset_time) < now) {
            await this.db.run(`
                INSERT OR REPLACE INTO rate_limits (user_id, command, uses, reset_time)
                VALUES (?, ?, 1, datetime('now', '+${windowMinutes} minutes'))`,
                userId, command
            );
            return true;
        }

        if (result.uses >= limit) return false;

        await this.db.run(`
            UPDATE rate_limits SET uses = uses + 1
            WHERE user_id = ? AND command = ?`,
            userId, command
        );
        return true;
    }

    // Admin Dashboard Stats
    async getAdminDashboardStats() {
        const stats = {
            totalUsers: await this.db.get('SELECT COUNT(*) as count FROM users'),
            totalItems: await this.db.get('SELECT COUNT(*) as count FROM items'),
            totalTransactions: await this.db.get('SELECT COUNT(*) as count FROM transactions'),
            recentCommands: await this.db.all(`
                SELECT command, COUNT(*) as uses 
                FROM command_logs 
                WHERE timestamp > datetime('now', '-24 hours')
                GROUP BY command
                ORDER BY uses DESC
                LIMIT 5
            `)
        };
        return stats;
    }

    // Maintenance Windows
    async scheduleMaintenanceWindow(startTime, endTime, reason, createdBy) {
        await this.db.run(`
            INSERT INTO maintenance_schedule (start_time, end_time, reason, created_by)
            VALUES (?, ?, ?, ?)`,
            startTime, endTime, reason, createdBy
        );
    }

    async isInMaintenanceWindow() {
        const window = await this.db.get(`
            SELECT * FROM maintenance_schedule
            WHERE datetime('now') BETWEEN start_time AND end_time
            LIMIT 1
        `);
        return window ? window : false;
    }

    // Backup/Restore
    async createBackup(createdBy) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `backup-${timestamp}.db`;
        
        await this.db.run('BEGIN TRANSACTION');
        try {
            // Create backup file
            await this.db.run(`VACUUM INTO '${filename}'`);
            
            // Log backup
            await this.db.run(`
                INSERT INTO backups (filename, created_by)
                VALUES (?, ?)`,
                filename, createdBy
            );
            
            await this.db.run('COMMIT');
            return filename;
        } catch (error) {
            await this.db.run('ROLLBACK');
            throw error;
        }
    }

    // Role-based permissions
    async addAdminRole(roleId, permissions) {
        await this.db.run(`
            INSERT OR REPLACE INTO admin_roles (role_id, permissions)
            VALUES (?, ?)`,
            roleId, JSON.stringify(permissions)
        );
    }

    async checkAdminPermission(userId, requiredPermission) {
        const roles = await this.db.all(`
            SELECT ar.permissions
            FROM admin_roles ar
            JOIN user_roles ur ON ur.role_id = ar.role_id
            WHERE ur.user_id = ?`,
            userId
        );

        return roles.some(role => {
            const permissions = JSON.parse(role.permissions);
            return permissions.includes(requiredPermission);
        });
    }

    generateVIN() {
        const chars = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789';
        const vinLength = 17;
        let vin = '';
        for (let i = 0; i < vinLength; i++) {
            vin += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return vin;
    }

    async addCarToUser(userId, car) {
        const vin = this.generateVIN();
        await this.db.run(`
            INSERT INTO inventory 
            (user_id, item_id, quantity, vin, purchase_date)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            userId, car.id, 1, vin
        );
        return vin;
    }

    async getCarDetails(vin) {
        return await this.db.get(`
            SELECT i.*, inv.vin, inv.purchase_date
            FROM inventory inv
            JOIN items i ON inv.item_id = i.id
            WHERE inv.vin = ?`,
            vin
        );
    }

    async toggleGodMode(userId) {
        try {
            const stmt = this.db.prepare(`
                UPDATE users 
                SET godmode = NOT godmode,
                    last_godmode = CASE 
                        WHEN godmode = 0 THEN CURRENT_TIMESTAMP
                        ELSE last_godmode 
                    END
                WHERE user_id = ?
            `);
            
            const result = stmt.run(userId);
            
            if (result.changes === 0) {
                throw new Error('User not found');
            }

            const user = this.stmt.getUser.get(userId);
            
            // Log the godmode toggle
            await this.logAdminAction(
                userId,
                'godmode_toggle',
                userId,
                { enabled: user.godmode }
            );
            
            return {
                success: true,
                enabled: user.godmode
            };
        } catch (error) {
            throw new Error(`Failed to toggle godmode: ${error.message}`);
        }
    }

    async checkGodMode(userId) {
        try {
            const user = await this.stmt.getUser.get(userId);
            return Boolean(user?.godmode);
        } catch (error) {
            console.error('Error checking godmode:', error);
            return false;
        }
    }

    async getUserJobs(userId) {
        const user = await User.findById(userId);
        return user?.jobs || [];
    }

    async updateUserJob(userId, jobType, updates) {
        return User.findOneAndUpdate(
            { _id: userId, "jobs.type": jobType },
            { $set: { "jobs.$": updates } },
            { new: true }
        );
    }

    async createBankAccount(userId, accountData) {
        return User.findByIdAndUpdate(
            userId,
            { $set: { [`banking.${accountData.type.toLowerCase()}`]: accountData } },
            { new: true }
        );
    }

    async getBankAccount(userId, accountType) {
        const user = await User.findById(userId);
        return user?.banking?.[accountType.toLowerCase()];
    }

    async updateBankAccount(userId, accountType, updates) {
        return User.findOneAndUpdate(
            { _id: userId },
            { $set: { [`banking.${accountType.toLowerCase()}`]: updates } },
            { new: true }
        );
    }

    // Ticket methods
    async createTicket(ticketData) {
        const collection = this.db.collection('tickets');
        const ticket = {
            ...ticketData,
            createdAt: Date.now(),
            status: 'open',
            history: [{
                action: 'created',
                timestamp: Date.now(),
                userId: ticketData.createdBy
            }]
        };
        return await collection.insertOne(ticket);
    }

    async getTicket(ticketId) {
        const collection = this.db.collection('tickets');
        return await collection.findOne({ _id: ticketId });
    }

    async updateTicketStatus(ticketId, status, userId) {
        const collection = this.db.collection('tickets');
        const historyEntry = {
            action: status,
            timestamp: Date.now(),
            userId
        };
        return await collection.updateOne(
            { _id: ticketId },
            {
                $set: { status, lastUpdated: Date.now() },
                $push: { history: historyEntry }
            }
        );
    }

    async extendTicketTimeout(ticketId, newTimeout, userId) {
        const collection = this.db.collection('tickets');
        const historyEntry = {
            action: 'extended',
            timestamp: Date.now(),
            userId,
            newTimeout
        };
        return await collection.updateOne(
            { _id: ticketId },
            {
                $set: { autoCloseTime: newTimeout },
                $push: { history: historyEntry }
            }
        );
    }

    async getActiveTickets() {
        const collection = this.db.collection('tickets');
        return await collection.find({ 
            status: 'open',
            autoCloseTime: { $gt: Date.now() }
        }).toArray();
    }

    async getTicketHistory(userId) {
        const collection = this.db.collection('tickets');
        return await collection.find({
            $or: [
                { createdBy: userId },
                { assignedTo: userId }
            ]
        }).sort({ createdAt: -1 }).toArray();
    }

    async getExpiredTickets() {
        const collection = this.db.collection('tickets');
        return await collection.find({
            status: 'open',
            autoCloseTime: { $lte: Date.now() }
        }).toArray();
    }

    async getLastWorkTime(userId) {
        const query = 'SELECT last_work_time FROM users WHERE user_id = ?';
        const result = await this.db.get(query, [userId]);
        return result ? result.last_work_time : null;
    }

    async updateLastWorkTime(userId, timestamp) {
        const query = 'UPDATE users SET last_work_time = ? WHERE user_id = ?';
        await this.db.run(query, [timestamp, userId]);
    }
}

const createTables = () => {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            username TEXT,
            daily_bonus INTEGER,
            level INTEGER DEFAULT 1  -- New column for user level
        )
    `).run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS achievements (
            achievement_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT,
            achievement_name TEXT,
            date_achieved TEXT,
            FOREIGN KEY (user_id) REFERENCES users(user_id)
        )
    `).run();
};

export const dbManager = new DatabaseManager();

export default db;

const log = new Logger('Database');

function logVPSOperation(error) {
    // Example alternative VPS logging
    console.warn('[VPS Error Detected]', error.message);
}

export class DatabaseManager {
    constructor() {
        this.localPool = null;
        this.vpsPool = null;
    }

    async connect() {
        try {
            // Create local connection pool
            this.localPool = await mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });

            // Create VPS connection pool if VPS credentials are provided
            if (process.env.VPS_DB_HOST) {
                this.vpsPool = await mysql.createPool({
                    host: process.env.VPS_DB_HOST,
                    user: process.env.VPS_DB_USER,
                    password: process.env.VPS_DB_PASSWORD,
                    database: process.env.VPS_DB_NAME,
                    waitForConnections: true,
                    connectionLimit: 5,
                    queueLimit: 0
                });
            }

            log.info('Database pools created successfully');
            return true;
        } catch (error) {
            log.error('Failed to create database pools:', error);
            throw error;
        }
    }

    async query(sql, params, useVPS = false) {
        try {
            const pool = useVPS ? this.vpsPool : this.localPool;
            if (!pool) {
                throw new Error('Database pool not initialized');
            }

            // Extra VPS checks
            if (useVPS) {
                // ...alternative feature checks...
            }

            const [results] = await pool.execute(sql, params);
            return results;
        } catch (error) {
            if (useVPS) logVPSOperation(error);
            log.error('Query error:', error);
            throw error;
        }
    }

    async end() {
        if (this.localPool) await this.localPool.end();
        if (this.vpsPool) await this.vpsPool.end();
    }
}

export const db = new DatabaseManager();
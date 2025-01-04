import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Logger } from '../utils/logger.js';
import { QueueManager } from './managers/QueueManager.js';
import { CacheManager } from './managers/CacheManager.js';

const log = new Logger('DatabaseManager');

export class DatabaseManager {
    constructor(dbPath) {
        this.dbPath = dbPath;
        this.statements = new Map();
        
        this.queueManager = new QueueManager();
        this.cacheManager = new CacheManager();
        this.setupQueueListeners();
    }

    setupQueueListeners() {
        this.queueManager.on('queued', ({ queueName, queueSize }) => {
            log.debug(`Added to queue ${queueName}, size: ${queueSize}`);
        });

        this.queueManager.on('batchProcessed', ({ queueName, batchSize, results }) => {
            const failed = results.filter(r => r.status === 'rejected').length;
            log.info(`Processed ${batchSize} items from ${queueName}, ${failed} failed`);
        });
    }

    async initialize() {
        try {
            // Initialize database connection
            this.db = new Database(this.dbPath);
            this.db.pragma('journal_mode = WAL');
            this.db.pragma('foreign_keys = ON');

            // Load and execute migrations
            await this.runMigrations();

            // Prepare common statements
            this.prepareStatements();

            log.info('Database initialized successfully');
        } catch (error) {
            log.error('Failed to initialize database:', error);
            throw error;
        }
    }

    async runMigrations() {
        // Start transaction for migrations
        const migration = this.db.transaction(() => {
            // Read and execute migration files
            const migrationPath = join(process.cwd(), 'db', 'migrations');
            const migrationFile = readFileSync(join(migrationPath, '001_initial_schema.sql'), 'utf8');
            
            // Split and execute each statement
            migrationFile.split(';').forEach(statement => {
                if (statement.trim()) {
                    this.db.prepare(statement).run();
                }
            });
        });

        migration();
    }

    prepareStatements() {
        // User statements
        this.statements.set('getUser', this.db.prepare('SELECT * FROM users WHERE id = ?'));
        this.statements.set('createUser', this.db.prepare(`
            INSERT INTO users (id, username) VALUES (?, ?)
            ON CONFLICT(id) DO UPDATE SET username = excluded.username
        `));
        this.statements.set('updateUserCoins', this.db.prepare(`
            UPDATE users SET coins = coins + ? WHERE id = ?
        `));

        // Inventory statements
        this.statements.set('getInventory', this.db.prepare(`
            SELECT i.*, inv.quantity, inv.stats 
            FROM inventories inv
            JOIN items i ON i.id = inv.item_id
            WHERE inv.user_id = ?
        `));
        this.statements.set('addInventoryItem', this.db.prepare(`
            INSERT INTO inventories (user_id, item_id, quantity, stats)
            VALUES (?, ?, ?, ?)
            ON CONFLICT(user_id, item_id) DO UPDATE SET
            quantity = quantity + excluded.quantity,
            stats = CASE 
                WHEN excluded.stats IS NOT NULL THEN excluded.stats 
                ELSE stats 
            END
        `));

        // Car inventory statements
        this.statements.set('getUserCars', this.db.prepare(`
            SELECT c.*, ci.condition, ci.mileage, ci.mods, ci.stats
            FROM car_inventories ci
            JOIN cars c ON c.id = ci.car_id
            WHERE ci.user_id = ?
        `));
        this.statements.set('addCarToInventory', this.db.prepare(`
            INSERT INTO car_inventories (user_id, car_id, condition, mileage, mods, stats)
            VALUES (?, ?, ?, ?, ?, ?)
        `));

        // Property Management
        this.statements.set('getUserProperties', this.db.prepare(`
            SELECT p.*, up.purchase_price, up.condition, up.upgrades, up.last_rent_collection
            FROM user_properties up
            JOIN properties p ON p.id = up.property_id
            WHERE up.user_id = ?
        `));

        // Business Management
        this.statements.set('getUserBusinesses', this.db.prepare(`
            SELECT b.*, ub.level, ub.income_multiplier, ub.employees, ub.upgrades
            FROM user_businesses ub
            JOIN businesses b ON b.id = ub.business_id
            WHERE ub.user_id = ?
        `));

        // Jobs & Experience
        this.statements.set('getUserJob', this.db.prepare(`
            SELECT j.*, jt.title as tier_title, jt.salary_multiplier
            FROM jobs j
            JOIN job_tiers jt ON j.id = jt.job_id
            WHERE j.id = (SELECT job_id FROM users WHERE id = ?)
        `));

        // Banking & Investment
        this.statements.set('getUserBankAccount', this.db.prepare(`
            SELECT * FROM bank_accounts WHERE user_id = ? AND account_type = ?
        `));

        this.statements.set('getUserInvestments', this.db.prepare(`
            SELECT s.*, ui.shares, ui.average_buy_price
            FROM user_investments ui
            JOIN stocks s ON s.id = ui.stock_id
            WHERE ui.user_id = ?
        `));

        // Market & Trading
        this.statements.set('getActiveListings', this.db.prepare(`
            SELECT ml.*, u.username as seller_name
            FROM market_listings ml
            JOIN users u ON u.id = ml.seller_id
            WHERE ml.status = 'active' AND ml.expires_at > datetime('now')
            ORDER BY ml.created_at DESC
            LIMIT ? OFFSET ?
        `));

        // ... prepare other common statements ...
    }

    // Transaction wrapper
    transaction(callback) {
        const transaction = this.db.transaction(callback);
        return transaction();
    }

    // Getters with type validation
    getUser(userId) {
        if (typeof userId !== 'string') throw new Error('userId must be a string');
        return this.statements.get('getUser').get(userId);
    }

    async executeQuery(sql, params = [], options = {}) {
        const cacheKey = this.cacheManager.generateKey(sql, params);

        if (options.useCache) {
            const cached = await this.cacheManager.get(cacheKey);
            if (cached) return cached;
        }

        if (options.queue) {
            return new Promise((resolve, reject) => {
                this.queueManager.addToQueue('queries', async () => {
                    try {
                        const result = await this.db.prepare(sql).run(params);
                        if (options.useCache) {
                            await this.cacheManager.set(cacheKey, result);
                        }
                        resolve(result);
                    } catch (error) {
                        reject(error);
                    }
                }, options.priority);
            });
        }

        const result = await this.db.prepare(sql).run(params);
        if (options.useCache) {
            await this.cacheManager.set(cacheKey, result);
        }
        return result;
    }

    // Property Methods
    async purchaseProperty(userId, propertyId, price) {
        return this.transaction(() => {
            const user = this.getUser(userId);
            if (user.coins < price) throw new Error('Insufficient funds');

            this.statements.get('updateUserCoins').run(-price, userId);
            this.statements.get('addProperty').run(userId, propertyId, price);
        });
    }

    async collectRent(userId, propertyId) {
        return this.transaction(() => {
            const property = this.statements.get('getUserProperty').get(userId, propertyId);
            if (!property) throw new Error('Property not found');

            const rentDue = this.calculateRentDue(property);
            if (rentDue <= 0) throw new Error('No rent due yet');

            this.statements.get('updateUserCoins').run(rentDue, userId);
            this.statements.get('updateRentCollection').run(propertyId);
        });
    }

    // Business Methods
    async manageBusinessEmployees(userId, businessId, action, employeeData) {
        return this.transaction(() => {
            const business = this.statements.get('getUserBusiness').get(userId, businessId);
            if (!business) throw new Error('Business not found');

            const employees = JSON.parse(business.employees || '[]');
            switch (action) {
                case 'hire':
                    if (employees.length >= business.employee_slots) 
                        throw new Error('Maximum employees reached');
                    employees.push(employeeData);
                    break;
                case 'fire':
                    const index = employees.findIndex(e => e.id === employeeData.id);
                    if (index > -1) employees.splice(index, 1);
                    break;
            }

            this.statements.get('updateBusinessEmployees').run(
                JSON.stringify(employees), userId, businessId
            );
        });
    }

    // Investment Methods
    async processStockTrade(userId, stockId, shares, action) {
        return this.transaction(() => {
            const stock = this.statements.get('getStock').get(stockId);
            if (!stock) throw new Error('Stock not found');

            const cost = stock.current_price * shares;
            const user = this.getUser(userId);

            if (action === 'buy') {
                if (user.coins < cost) throw new Error('Insufficient funds');
                this.statements.get('updateUserCoins').run(-cost, userId);
                this.statements.get('addInvestment').run(userId, stockId, shares, stock.current_price);
            } else {
                const investment = this.statements.get('getUserInvestment').get(userId, stockId);
                if (!investment || investment.shares < shares) throw new Error('Insufficient shares');
                
                this.statements.get('updateUserCoins').run(cost, userId);
                this.statements.get('updateInvestment').run(shares, userId, stockId);
            }
        });
    }

    // Market Methods
    async createMarketListing(userId, itemType, itemId, quantity, pricePerUnit) {
        return this.transaction(() => {
            // Verify item ownership
            const hasItem = this.verifyItemOwnership(userId, itemType, itemId, quantity);
            if (!hasItem) throw new Error('Insufficient items');

            // Create listing
            const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days
            this.statements.get('createListing').run(
                userId, itemType, itemId, quantity, pricePerUnit, expiresAt
            );

            // Remove items from inventory
            this.removeItems(userId, itemType, itemId, quantity);
        });
    }

    // Add other methods...
}

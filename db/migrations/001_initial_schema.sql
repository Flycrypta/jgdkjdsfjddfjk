-- Initial database schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
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
    settings JSON
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
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
);

-- Inventory table
CREATE TABLE IF NOT EXISTS inventory (
    user_id TEXT,
    item_id INTEGER,
    quantity INTEGER DEFAULT 0,
    vin TEXT UNIQUE,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (item_id) REFERENCES items(id)
);

-- Wheel system tables
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

-- Logging tables
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

-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
    user_id TEXT NOT NULL,
    command TEXT NOT NULL,
    uses INTEGER DEFAULT 1,
    reset_time TIMESTAMP,
    PRIMARY KEY (user_id, command)
);

-- Initialize default reward tiers
INSERT OR IGNORE INTO reward_tiers (name, min_amount, max_amount, probability, is_vip) VALUES
    ('Common', 100, 1000, 0.6, FALSE),
    ('Rare', 1000, 5000, 0.3, FALSE),
    ('Epic', 5000, 20000, 0.08, FALSE),
    ('Legendary', 20000, 100000, 0.02, FALSE),
    ('VIP Common', 200, 2000, 0.5, TRUE),
    ('VIP Rare', 2000, 10000, 0.3, TRUE),
    ('VIP Epic', 10000, 40000, 0.15, TRUE),
    ('VIP Legendary', 40000, 200000, 0.05, TRUE);

-- Initialize jackpot
INSERT OR IGNORE INTO jackpot (id, amount) VALUES (1, 1000000);

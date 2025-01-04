-- Drop existing database and create new one
DROP TABLE IF EXISTS inventory;
DROP TABLE IF EXISTS item_statistics;
DROP TABLE IF EXISTS item_history;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS users;

-- Core tables first
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_level CHECK (level >= 1)
);

-- Add required indexes
CREATE INDEX IF NOT EXISTS idx_users_coins ON users(coins);
CREATE INDEX IF NOT EXISTS idx_users_level ON users(level);

CREATE TABLE items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    price INTEGER DEFAULT 0,
    rarity TEXT DEFAULT 'common',
    properties JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, type)
);

-- Create dependent tables
CREATE TABLE inventory (
    user_id TEXT,
    item_id INTEGER,
    quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (item_id) REFERENCES items(id),
    PRIMARY KEY (user_id, item_id)
);

CREATE TABLE item_statistics (
    item_id INTEGER PRIMARY KEY,
    total_obtained INTEGER DEFAULT 0,
    current_owners INTEGER DEFAULT 0,
    last_obtained_at DATETIME,
    rarity_percentage REAL,
    times_appeared INTEGER DEFAULT 0,
    FOREIGN KEY (item_id) REFERENCES items(id)
);

CREATE TABLE item_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    source TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES items(id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create indexes after tables
CREATE INDEX idx_items_rarity ON items(rarity);
CREATE INDEX idx_inventory_user_item ON inventory(user_id, item_id);
CREATE INDEX idx_inventory_item ON inventory(item_id);
CREATE INDEX idx_item_history_item ON item_history(item_id);
CREATE INDEX idx_item_history_user ON item_history(user_id);
CREATE INDEX idx_item_stats_rarity ON item_statistics(rarity_percentage);

CREATE TABLE IF NOT EXISTS daily_rewards (
    user_id TEXT PRIMARY KEY,
    last_daily TEXT,
    streak_count INTEGER DEFAULT 0,
    last_streak_update DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Settings and configuration
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS server_settings (
    guild_id TEXT PRIMARY KEY,
    ticket_commands_enabled INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    tickets_enabled INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS license_keys (
    key_id TEXT PRIMARY KEY,
    key_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    used_by TEXT DEFAULT NULL,
    used_at DATETIME DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id TEXT PRIMARY KEY,
    role_type TEXT NOT NULL,
    granted_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wheel_spins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    wheel_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    spin_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_license_keys_type ON license_keys(key_type);
CREATE INDEX IF NOT EXISTS idx_license_keys_used ON license_keys(used_by);

CREATE TABLE IF NOT EXISTS wheel_statistics (
    wheel_id TEXT PRIMARY KEY,
    total_spins INTEGER DEFAULT 0,
    total_coins_spent INTEGER DEFAULT 0,
    most_common_prize TEXT,
    last_spin_at DATETIME,
    average_prize_value REAL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_item_history_item ON item_history(item_id);
CREATE INDEX IF NOT EXISTS idx_item_history_user ON item_history(user_id);
CREATE INDEX IF NOT EXISTS idx_item_stats_rarity ON item_statistics(rarity_percentage);

-- Add missing tables for transactions and coin management
CREATE TABLE IF NOT EXISTS coin_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_user TEXT NOT NULL,
    to_user TEXT NOT NULL,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user) REFERENCES users(user_id),
    FOREIGN KEY (to_user) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS wheels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    cost INTEGER NOT NULL,
    enabled INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coin_transactions_users ON coin_transactions(from_user, to_user);
CREATE INDEX IF NOT EXISTS idx_wheels_enabled ON wheels(enabled);

-- Fix auction house tables
CREATE TABLE IF NOT EXISTS auctions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id TEXT NOT NULL,
    inventory_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    starting_price INTEGER NOT NULL CHECK (starting_price >= 0),
    current_price INTEGER NOT NULL CHECK (current_price >= 0),
    buyout_price INTEGER CHECK (buyout_price IS NULL OR buyout_price > starting_price),
    highest_bidder TEXT,
    end_time DATETIME NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(user_id),
    FOREIGN KEY (highest_bidder) REFERENCES users(user_id),
    FOREIGN KEY (inventory_id) REFERENCES inventory(id)
);

CREATE TABLE IF NOT EXISTS auction_bids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    auction_id INTEGER NOT NULL,
    bidder_id TEXT NOT NULL,
    bid_amount INTEGER NOT NULL,
    bid_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id),
    FOREIGN KEY (bidder_id) REFERENCES users(user_id)
);

CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_end_time ON auctions(end_time);

-- Car system tables
CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    speed INTEGER NOT NULL,
    user_id TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS car_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vin TEXT NOT NULL,
    event_type TEXT NOT NULL, -- 'PURCHASE', 'SERVICE', 'ACCIDENT', etc.
    event_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    mileage INTEGER,
    location TEXT,
    reported_by TEXT,
    FOREIGN KEY (vin) REFERENCES cars(vin)
);

CREATE TABLE IF NOT EXISTS car_service_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vin TEXT NOT NULL,
    service_type TEXT NOT NULL,
    service_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    mileage INTEGER,
    cost INTEGER,
    notes TEXT,
    mechanic_id TEXT,
    FOREIGN KEY (vin) REFERENCES cars(id),
    FOREIGN KEY (mechanic_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS car_modifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    vin TEXT NOT NULL,
    mod_type TEXT NOT NULL,
    description TEXT,
    installation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    cost INTEGER,
    installer_id TEXT,
    FOREIGN KEY (vin) REFERENCES cars(id),
    FOREIGN KEY (installer_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS car_races (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    race_name TEXT NOT NULL,
    race_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    location TEXT NOT NULL,
    winner_id TEXT,
    FOREIGN KEY (winner_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS race_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    race_id INTEGER NOT NULL,
    car_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    finish_time INTEGER,
    position INTEGER,
    FOREIGN KEY (race_id) REFERENCES car_races(id),
    FOREIGN KEY (car_id) REFERENCES cars(id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Indexes for cars
CREATE INDEX IF NOT EXISTS idx_cars_owner ON cars(user_id);
CREATE INDEX IF NOT EXISTS idx_car_history_vin ON car_history(vin);
CREATE INDEX IF NOT EXISTS idx_car_service_vin ON car_service_records(vin);

-- Add new reward tables
CREATE TABLE IF NOT EXISTS wheel_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wheel_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    rarity TEXT NOT NULL,
    weight INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (wheel_id) REFERENCES wheels(id)
);

CREATE TABLE IF NOT EXISTS vip_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL,
    rarity TEXT NOT NULL,
    min_value INTEGER NOT NULL,
    max_value INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_wheel_rewards_wheel ON wheel_rewards(wheel_id);
CREATE INDEX IF NOT EXISTS idx_wheel_rewards_rarity ON wheel_rewards(rarity);

-- Coin management tables
CREATE TABLE IF NOT EXISTS coin_locks (
    user_id TEXT PRIMARY KEY,
    locked_by TEXT NOT NULL,
    reason TEXT,
    locked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (locked_by) REFERENCES users(user_id)
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_coin_locks_user ON coin_locks(user_id);

-- Item management tables
CREATE TABLE IF NOT EXISTS reward_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    base_amount INTEGER NOT NULL,
    streak_bonus INTEGER DEFAULT 0,
    condition TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS item_properties (
    item_id INTEGER NOT NULL,
    property TEXT NOT NULL,
    value TEXT NOT NULL,
    FOREIGN KEY (item_id) REFERENCES items(id),
    PRIMARY KEY (item_id, property)
);

-- Add indexes for items tables
CREATE INDEX IF NOT EXISTS idx_items_rarity ON items(rarity);
CREATE INDEX IF NOT EXISTS idx_reward_types ON reward_types(type);

-- Add system settings table
CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Add additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_inventory_user_item ON inventory(user_id, item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_item ON inventory(item_id);
CREATE INDEX IF NOT EXISTS idx_auctions_seller ON auctions(seller_id);
CREATE INDEX IF NOT EXISTS idx_auctions_inventory ON auctions(inventory_id);

-- Add scheduler table for tasks
CREATE TABLE IF NOT EXISTS scheduled_tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    execute_at TIMESTAMP NOT NULL,
    data JSON,
    completed INTEGER DEFAULT 0
);

-- Game-specific Tables
CREATE TABLE IF NOT EXISTS elo_ratings (
    user_id TEXT PRIMARY KEY,
    elo INTEGER DEFAULT 1000,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS spin_usage (
    user_id TEXT PRIMARY KEY,
    daily_spins INTEGER DEFAULT 0,
    vip_spins INTEGER DEFAULT 0,
    last_spin_reset TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_inventory_user ON inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_items_rarity ON items(rarity);

-- Add trigger to auto-populate user_id if not provided
CREATE TRIGGER IF NOT EXISTS set_default_user_id
AFTER INSERT ON cars
WHEN NEW.user_id IS NULL
BEGIN
    UPDATE cars 
    SET user_id = (SELECT user_id FROM users ORDER BY created_at DESC LIMIT 1)
    WHERE id = NEW.id;
END;

-- Add performance tracking
CREATE TABLE IF NOT EXISTS performance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation TEXT NOT NULL,
    duration_ms REAL NOT NULL,
    success BOOLEAN NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_statistics (
    user_id TEXT PRIMARY KEY,
    cars_owned INTEGER DEFAULT 0,
    total_value INTEGER DEFAULT 0,
    races_won INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS car_market (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    car_id INTEGER NOT NULL,
    seller_id TEXT NOT NULL,
    price INTEGER NOT NULL,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id),
    FOREIGN KEY (seller_id) REFERENCES users(user_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_perf_logs_operation ON performance_logs(operation, timestamp);
CREATE INDEX IF NOT EXISTS idx_car_market_status ON car_market(status, created_at);
CREATE INDEX IF NOT EXISTS idx_user_stats_value ON user_statistics(total_value DESC);
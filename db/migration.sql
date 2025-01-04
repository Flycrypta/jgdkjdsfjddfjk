-- Add daily claims tracking table
CREATE TABLE IF NOT EXISTS coin_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Add index for faster daily claim lookups
CREATE INDEX IF NOT EXISTS idx_coin_rewards_user_reason 
ON coin_rewards(user_id, reason, awarded_at);

-- Make sure users table exists with required columns
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    coins INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing gems column to users table
ALTER TABLE users ADD COLUMN gems INTEGER DEFAULT 0;

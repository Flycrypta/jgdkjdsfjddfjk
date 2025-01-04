-- Create racing system tables

-- Ensure required tables exist first
CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    -- ...existing columns...
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- ...existing columns...
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Now create race tables
-- ...existing race_tracks table creation...

-- ...existing races table creation...

-- Update race_participants to ensure proper foreign keys
CREATE TABLE IF NOT EXISTS race_participants (
    race_id INTEGER,
    user_id TEXT,
    car_id INTEGER,
    position INTEGER,
    finish_time TIMESTAMP,
    reward_amount INTEGER CHECK (reward_amount >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (race_id, user_id),
    FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (car_id) REFERENCES inventory(item_id) ON DELETE SET NULL
);

-- ...existing indices and default data...

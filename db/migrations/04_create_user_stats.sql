CREATE TABLE IF NOT EXISTS user_stats (
    user_id TEXT PRIMARY KEY,
    health INTEGER DEFAULT 100,
    max_health INTEGER DEFAULT 100,
    strength INTEGER DEFAULT 10,
    defense INTEGER DEFAULT 10,
    experience INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS item_instances (
    instance_id TEXT PRIMARY KEY,
    item_id INTEGER,
    owner_id TEXT,
    durability INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES user_stats(user_id)
);

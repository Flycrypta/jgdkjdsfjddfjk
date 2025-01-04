-- Racing system tables

CREATE TABLE IF NOT EXISTS race_tracks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    length INTEGER NOT NULL CHECK (length > 0),
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    weather_effects BOOLEAN DEFAULT FALSE,
    min_level INTEGER DEFAULT 1,
    entry_fee INTEGER DEFAULT 0 CHECK (entry_fee >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS races (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track_id INTEGER NOT NULL,
    status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')) DEFAULT 'pending',
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    weather_condition TEXT,
    prize_pool INTEGER DEFAULT 0 CHECK (prize_pool >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (track_id) REFERENCES race_tracks(id)
);

CREATE TABLE IF NOT EXISTS race_participants (
    race_id INTEGER,
    user_id TEXT,
    car_id INTEGER,
    position INTEGER,
    finish_time TIMESTAMP,
    reward_amount INTEGER CHECK (reward_amount >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (race_id, user_id),
    FOREIGN KEY (race_id) REFERENCES races(id),
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (car_id) REFERENCES inventory(item_id)
);

-- Career system tables
CREATE TABLE IF NOT EXISTS user_jobs (
    user_id VARCHAR(64) REFERENCES users(id),
    job_type VARCHAR(50) NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    total_earnings BIGINT DEFAULT 0,
    reputation INTEGER DEFAULT 0,
    skills JSON,
    PRIMARY KEY (user_id, job_type)
);

-- Indices for better query performance
CREATE INDEX IF NOT EXISTS idx_races_status ON races(status);
CREATE INDEX IF NOT EXISTS idx_race_participants_user ON race_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_races_track ON races(track_id);

-- Insert some default tracks
INSERT OR IGNORE INTO race_tracks (name, length, difficulty, weather_effects, min_level, entry_fee) VALUES
    ('Rookie Circuit', 1000, 'easy', FALSE, 1, 100),
    ('Mountain Pass', 2000, 'medium', TRUE, 5, 500),
    ('Pro Speedway', 3000, 'hard', TRUE, 10, 1000);

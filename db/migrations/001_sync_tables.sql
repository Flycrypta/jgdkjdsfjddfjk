CREATE TABLE IF NOT EXISTS sync_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    table_name VARCHAR(255) NOT NULL,
    record_id VARCHAR(255) NOT NULL,
    operation ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    changes JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced BOOLEAN DEFAULT FALSE,
    sync_time TIMESTAMP NULL,
    origin_server VARCHAR(255) NOT NULL
);

CREATE INDEX idx_sync_status ON sync_log(synced);
CREATE INDEX idx_sync_table ON sync_log(table_name);

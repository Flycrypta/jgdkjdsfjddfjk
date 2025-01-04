CREATE TABLE IF NOT EXISTS sync_status (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('SUCCESS', 'FAILED', 'IN_PROGRESS') NOT NULL,
    error_message TEXT,
    retry_count INT DEFAULT 0,
    server_id VARCHAR(255) NOT NULL,
    UNIQUE KEY unique_server (server_id)
);

CREATE TABLE IF NOT EXISTS sync_retry_log (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sync_id BIGINT NOT NULL,
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    FOREIGN KEY (sync_id) REFERENCES sync_status(id)
);

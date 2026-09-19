-- Drop the old table first (if you have run it before)

CREATE DATABASE IF NOT EXISTS telegram_db;
USE telegram_db;
DROP TABLE IF EXISTS telegram_contacts;


CREATE TABLE telegram_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NULL,
    username VARCHAR(255) NULL,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    error_message TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
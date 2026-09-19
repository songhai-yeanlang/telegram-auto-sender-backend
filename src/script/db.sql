CREATE DATABASE IF NOT EXISTS telegram_auto_sender_db;


USE telegram_auto_sender_db;

CREATE TABLE IF NOT EXISTS telegram_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL UNIQUE, 
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending', 
    error_message TEXT DEFAULT NULL, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);



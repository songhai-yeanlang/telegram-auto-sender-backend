-- លុប Table ចាស់ចោលសិន (ប្រសិនបើអ្នកធ្លាប់បាន Run វារួច)

CREATE DATABASE IF NOT EXISTS telegram_db;
USE telegram_db;
DROP TABLE IF EXISTS telegram_contacts;

-- បង្កើត Table ថ្មីដែលប្រើ chat_id ជំនួស phone_number
CREATE TABLE telegram_contacts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id VARCHAR(50) NOT NULL UNIQUE,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    error_message TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
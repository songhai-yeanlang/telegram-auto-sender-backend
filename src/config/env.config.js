require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '12345678',
        name: process.env.DB_NAME || 'telegram_auto_sender_db'
    },
    telegram: {
        apiId: parseInt(process.env.API_ID, 10),
        apiHash: process.env.API_HASH,
        sessionString: process.env.SESSION_STRING || ''
    }
};
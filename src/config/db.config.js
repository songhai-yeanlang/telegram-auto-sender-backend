const mysql = require('mysql2/promise');
const env = require('./env.config');
const logger = require('../utils/logger.util');

const pool = mysql.createPool({
    host: env.db.host,
    user: env.db.user,
    password: env.db.password,
    database: env.db.name,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const connectDB = async () => {
    try {
        const connection = await pool.getConnection();
        logger.info(`[INFO] connect Database [${env.db.name}] is success`);
        connection.release();
    } catch (error) {
        logger.error('[ERROR] fail connect Database:', error);
        process.exit(1);
    }
};

module.exports = { connection: pool, connectDB };
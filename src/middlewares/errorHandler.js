const logger = require('../utils/logger.util');

const errorHandler = (err, req, res, next) => {
    logger.error("System Error", err.stack || err.message);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ success: false, message: err.message || 'Internal Server Error' });
};

module.exports = errorHandler;
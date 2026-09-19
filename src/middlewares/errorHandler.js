const logger = require('../utils/logger.util');

const errorHandler = (err, req, res, next) => {
    logger.error("System Error", err.stack);
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
};

module.exports = errorHandler;
const jwt = require('jsonwebtoken');
const env = require('../../config/env.config');
const logger = require('../../utils/logger.util');

const isLogin = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
        }
        const token = authHeader.split(' ')[1];
        // Verify the token
        const decoded = jwt.verify(token, env.jwtSecret);
        // Attach user info to request object
        req.user = decoded;
        next();
    } catch (error) {
        logger.error(`[isLogin Middleware] Error: ${error.message}`);
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
    }
};

module.exports = {
    isLogin
};

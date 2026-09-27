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

const verifyResetToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Reset token is required in Authorization header (Bearer <token>)'
            });
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Reset token is empty'
            });
        }
        req.resetToken = token;
        next();
    } catch (error) {
        logger.error(`[verifyResetToken Middleware] Error: ${error.message}`);
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired reset token' });
    }
};

module.exports = {
    isLogin,
    verifyResetToken
};

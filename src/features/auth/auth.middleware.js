const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
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
        let token = null;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.split(' ')[1];
        } else if (req.body && (req.body.token || req.body.resetToken)) {
            token = req.body.token || req.body.resetToken;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: Reset token is required'
            });
        }

        req.resetToken = token;
        next();
    } catch (error) {
        logger.error(`[verifyResetToken Middleware] Error: ${error.message}`);
        return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired reset token' });
    }
};

// ─── Rate Limiters for Authentication Endpoints ───────────────
const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 10, // Max 10 attempts per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many login attempts. Please try again after 1 minute.'
    }
});

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Max 5 requests per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many password reset requests. Please try again after 15 minutes.'
    }
});

const verifyOtpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Max 10 attempts per 15 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many incorrect OTP attempts. Please wait 15 minutes or request a new code.'
    }
});

module.exports = {
    isLogin,
    verifyResetToken,
    loginLimiter,
    forgotPasswordLimiter,
    verifyOtpLimiter
};

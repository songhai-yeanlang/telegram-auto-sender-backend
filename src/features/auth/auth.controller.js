const authService = require('./auth.service');
const logger = require('../../utils/logger.util');

const login = async (req, res, next) => {
    try {
        const result = await authService.loginUser(req.body);
        res.status(200).json({ success: true, message: 'Login successful', data: result });
    } catch (error) {
        logger.error(`[Login] Error: ${error.message}`);
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        const result = await authService.forgotPassword(req.body);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        logger.error(`[Forgot Password] Error: ${error.message}`);
        next(error);
    }
};

const verifyOtp = async (req, res, next) => {
    try {
        const result = await authService.verifyOtp(req.body);
        res.status(200).json({ success: true, message: result.message, resetToken: result.resetToken });
    } catch (error) {
        logger.error(`[Verify OTP] Error: ${error.message}`);
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        const result = await authService.resetPassword(req.body);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        logger.error(`[Reset Password] Error: ${error.message}`);
        next(error);
    }
};

const changePassword = async (req, res, next) => {
    try {
        const result = await authService.changePassword(req.user.id, req.body);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        logger.error(`[Change Password] Error: ${error.message}`);
        next(error);
    }
};

const logout = async (req, res, next) => {
    try {
        const result = await authService.logoutUser(req.user.id);
        res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        logger.error(`[Logout] Error: ${error.message}`);
        next(error);
    }
};

module.exports = { login, forgotPassword, verifyOtp, resetPassword, changePassword, logout };

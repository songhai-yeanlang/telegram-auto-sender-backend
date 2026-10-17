const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { isLogin, verifyResetToken, loginLimiter, forgotPasswordLimiter, verifyOtpLimiter } = require('./auth.middleware');
const avatarUpload = require('../../middlewares/avatarUpload.middleware');

router.post('/login', loginLimiter, authController.login);
router.post('/forgot-password', forgotPasswordLimiter, authController.forgotPassword);
router.post('/verify-otp', verifyOtpLimiter, authController.verifyOtp);
router.post('/reset-password', verifyResetToken, authController.resetPassword);
router.post('/logout', isLogin, authController.logout);
router.post('/change-password', isLogin, authController.changePassword);
router.put('/update-profile', isLogin, authController.updateProfile);
router.put('/upload-avatar', isLogin, avatarUpload, authController.uploadAvatar);

module.exports = router;
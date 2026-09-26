const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { isLogin } = require('./auth.middleware');

router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);
router.post('/logout', isLogin, authController.logout);
router.post('/change-password', isLogin, authController.changePassword);

module.exports = router;
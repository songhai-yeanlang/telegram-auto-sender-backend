const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../../config/env.config');
const authModel = require('./auth.model');
const { sendOtpEmail } = require('../../utils/mail.util');
const {
    loginSchema,
    forgotPasswordSchema,
    verifyOtpSchema,
    resetPasswordSchema,
    changePasswordSchema
} = require('./auth.validation');

// ─── Login ───────────────────────────────────────────────────
const loginUser = async (body) => {
    const { error, value } = loginSchema.validate(body);
    if (error) {
        const err = new Error(error.details[0].message);
        err.statusCode = 400;
        throw err;
    }

    const { email, password } = value;
    const user = await authModel.getUserByEmail(email);
    if (!user) {
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        throw err;
    }

    // Generate tokens
    const token = jwt.sign({ id: user.id }, env.jwtSecret, { expiresIn: '1d' });
    const refreshToken = jwt.sign({ id: user.id }, env.jwtSecret, { expiresIn: '7d' });
    const refreshTokenExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await authModel.saveTokens(user.id, token, refreshToken, refreshTokenExpires);

    return {
        token,
        refreshToken,
        user: { id: user.id, email: user.email }
    };
};

// ─── Forgot Password (Send OTP) ──────────────────────────────
const forgotPassword = async (body) => {
    const { error, value } = forgotPasswordSchema.validate(body);
    if (error) {
        const err = new Error(error.details[0].message);
        err.statusCode = 400;
        throw err;
    }

    const { email } = value;
    const user = await authModel.getUserByEmail(email);
    if (!user) {
        // Don't reveal whether email exists for security
        return { message: 'If this email is registered, you will receive an OTP shortly' };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await authModel.savePasswordResetOtp(email, otp, expiresAt);
    await sendOtpEmail(email, otp);

    return { message: 'If this email is registered, you will receive an OTP shortly' };
};

// ─── Verify OTP ───────────────────────────────────────────────
const verifyOtp = async (body) => {
    const { error, value } = verifyOtpSchema.validate(body);
    if (error) {
        const err = new Error(error.details[0].message);
        err.statusCode = 400;
        throw err;
    }

    const { email, otp } = value;
    const user = await authModel.getUserByEmail(email);
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    const resetRecord = await authModel.getLatestPasswordResetOtp(email);
    if (!resetRecord || resetRecord.otp !== otp) {
        const err = new Error('Invalid OTP');
        err.statusCode = 400;
        throw err;
    }

    if (new Date() > new Date(resetRecord.expires_at)) {
        const err = new Error('OTP has expired. Please request a new one');
        err.statusCode = 400;
        throw err;
    }

    // Clear OTP so it can't be reused
    await authModel.clearPasswordResetOtp(email);

    // Generate short-lived reset token (15 minutes)
    const resetToken = jwt.sign(
        { id: user.id, action: 'reset_password' },
        env.jwtSecret,
        { expiresIn: '15m' }
    );

    return { message: 'OTP verified successfully', resetToken };
};

// ─── Reset Password ───────────────────────────────────────────
const resetPassword = async (body) => {
    const { error, value } = resetPasswordSchema.validate(body);
    if (error) {
        const err = new Error(error.details[0].message);
        err.statusCode = 400;
        throw err;
    }

    const { token, newPassword } = value;

    let decoded;
    try {
        decoded = jwt.verify(token, env.jwtSecret);
        if (decoded.action !== 'reset_password') throw new Error();
    } catch {
        const err = new Error('Invalid or expired reset token');
        err.statusCode = 401;
        throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    await authModel.updatePasswordById(decoded.id, newPasswordHash);

    return { message: 'Password has been reset successfully' };
};

// ─── Change Password (Logged in) ─────────────────────────────
const changePassword = async (userId, body) => {
    const { error, value } = changePasswordSchema.validate(body);
    if (error) {
        const err = new Error(error.details[0].message);
        err.statusCode = 400;
        throw err;
    }

    const { oldPassword, newPassword } = value;
    const user = await authModel.getUserById(userId);
    if (!user) {
        const err = new Error('User not found');
        err.statusCode = 404;
        throw err;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        const err = new Error('Incorrect old password');
        err.statusCode = 400;
        throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    await authModel.updatePasswordById(userId, newPasswordHash);

    return { message: 'Password has been changed successfully' };
};

// ─── Logout ───────────────────────────────────────────────────
const logoutUser = async (userId) => {
    await authModel.clearTokens(userId);
    return { message: 'Logged out successfully' };
};

module.exports = {
    loginUser,
    forgotPassword,
    verifyOtp,
    resetPassword,
    changePassword,
    logoutUser
};

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

// ─── Login (Username or Email) ───────────────────────────────
const loginUser = async (body) => {
    const { error, value } = loginSchema.validate(body);
    if (error) {
        const err = new Error(error.details[0].message);
        err.statusCode = 400;
        throw err;
    }

    const identifier = value.identifier || value.username || value.email;
    const { password } = value;

    const admin = await authModel.getAdminByUsernameOrEmail(identifier);
    if (!admin) {
        const err = new Error('Invalid username/email or password');
        err.statusCode = 401;
        throw err;
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
        const err = new Error('Invalid username/email or password');
        err.statusCode = 401;
        throw err;
    }

    // Update last_login timestamp in admin_account
    await authModel.updateLastLogin(admin.id);

    // Generate JWT token
    const token = jwt.sign(
        { id: admin.id, username: admin.username, email: admin.email },
        env.jwtSecret,
        { expiresIn: '1d' }
    );

    return {
        token,
        admin: {
            id: admin.id,
            username: admin.username,
            email: admin.email
        }
    };
};

// ─── Forgot Password (Send OTP via Nodemailer) ───────────────
const forgotPassword = async (body) => {
    const { error, value } = forgotPasswordSchema.validate(body);
    if (error) {
        const err = new Error(error.details[0].message);
        err.statusCode = 400;
        throw err;
    }

    const identifier = value.email || value.username;
    const admin = await authModel.getAdminByUsernameOrEmail(identifier);
    if (!admin) {
        // Return generic message for security
        return { message: 'If this account is registered, you will receive an OTP code shortly' };
    }

    // Generate 6-digit numeric OTP and 15-minute expiration
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Store OTP in admin_account (reset_token, token_expires_at)
    await authModel.saveResetToken(admin.id, otp, expiresAt);

    // Send OTP email using Nodemailer
    await sendOtpEmail(admin.email, otp);

    return { message: 'If this account is registered, you will receive an OTP code shortly' };
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
    const admin = await authModel.getAdminByEmail(email);
    if (!admin || admin.reset_token !== otp) {
        const err = new Error('Invalid OTP code');
        err.statusCode = 400;
        throw err;
    }

    if (new Date() > new Date(admin.token_expires_at)) {
        const err = new Error('OTP code has expired. Please request a new one');
        err.statusCode = 400;
        throw err;
    }

    // Generate short-lived reset token (15 minutes)
    const resetToken = jwt.sign(
        { id: admin.id, action: 'reset_password' },
        env.jwtSecret,
        { expiresIn: '15m' }
    );

    // Update reset_token in admin_account with the verified resetToken
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await authModel.saveResetToken(admin.id, resetToken, expiresAt);

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

    const token = value.token || value.resetToken;
    const { newPassword } = value;

    let decoded;
    try {
        decoded = jwt.verify(token, env.jwtSecret);
        if (decoded.action !== 'reset_password') throw new Error();
    } catch {
        const err = new Error('Invalid or expired reset token');
        err.statusCode = 401;
        throw err;
    }

    const admin = await authModel.getAdminById(decoded.id);
    if (!admin || admin.reset_token !== token) {
        const err = new Error('Invalid or expired reset token');
        err.statusCode = 400;
        throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    await authModel.updatePasswordById(admin.id, newPasswordHash);

    return { message: 'Password has been reset successfully' };
};

// ─── Change Password (Logged in) ─────────────────────────────
const changePassword = async (adminId, body) => {
    const { error, value } = changePasswordSchema.validate(body);
    if (error) {
        const err = new Error(error.details[0].message);
        err.statusCode = 400;
        throw err;
    }

    const { oldPassword, newPassword } = value;
    const admin = await authModel.getAdminById(adminId);
    if (!admin) {
        const err = new Error('Admin account not found');
        err.statusCode = 404;
        throw err;
    }

    const isMatch = await bcrypt.compare(oldPassword, admin.password_hash);
    if (!isMatch) {
        const err = new Error('Incorrect old password');
        err.statusCode = 400;
        throw err;
    }

    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    await authModel.updatePasswordById(adminId, newPasswordHash);

    return { message: 'Password has been changed successfully' };
};

// ─── Logout ───────────────────────────────────────────────────
const logoutUser = async () => {
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

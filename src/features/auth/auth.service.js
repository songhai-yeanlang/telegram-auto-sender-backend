const path = require('path');
const fs = require('fs');
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
    changePasswordSchema,
    updateProfileSchema
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
        const err = new Error('Invalid email or password');
        err.statusCode = 401;
        throw err;
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
        const err = new Error('Invalid email or password');
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
            email: admin.email,
            avatar: admin.avatar || null
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


const resetPassword = async (body) => {
    const { error, value } = resetPasswordSchema.validate(body);
    if (error) {
        const err = new Error(error.details[0].message);
        err.statusCode = 400;
        throw err;
    }

    const token = value.token || value.resetToken;
    if (!token) {
        const err = new Error('Reset token is required in Authorization header (Bearer <token>)');
        err.statusCode = 401;
        throw err;
    }

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

// ─── Update Profile (username only) ───────────────────────────
const updateProfile = async (adminId, body) => {
    const { error, value } = updateProfileSchema.validate(body, { abortEarly: false });
    if (error) {
        const err = new Error(error.details.map(d => d.message).join(', '));
        err.statusCode = 400;
        throw err;
    }

    const admin = await authModel.getAdminById(adminId);
    if (!admin) {
        const err = new Error('Admin account not found');
        err.statusCode = 404;
        throw err;
    }

    // Check for username conflict (if different from current)
    if (value.username && value.username !== admin.username) {
        const existing = await authModel.getAdminByUsername(value.username);
        if (existing && existing.id !== adminId) {
            const err = new Error('Username is already taken');
            err.statusCode = 409;
            throw err;
        }
    }

    await authModel.updateProfileById(adminId, { username: value.username });

    // Fetch fresh admin data to return updated info
    const updated = await authModel.getAdminById(adminId);

    return {
        message: 'Profile updated successfully',
        admin: {
            id: updated.id,
            username: updated.username,
            email: updated.email,
            avatar: updated.avatar || null
        }
    };
};

// ─── Upload / Update Avatar ───────────────────────────────────
const updateAvatar = async (adminId, file) => {
    if (!file) {
        const err = new Error('No image file provided');
        err.statusCode = 400;
        throw err;
    }

    const admin = await authModel.getAdminById(adminId);
    if (!admin) {
        const err = new Error('Admin account not found');
        err.statusCode = 404;
        throw err;
    }

    // If an old avatar file exists on disk, remove it to prevent orphaned files
    if (admin.avatar && admin.avatar.startsWith('/uploads/avatars/')) {
        const oldFilename = path.basename(admin.avatar);
        const oldFilePath = path.join(__dirname, '../../../uploads/avatars', oldFilename);
        if (fs.existsSync(oldFilePath)) {
            try {
                fs.unlinkSync(oldFilePath);
            } catch (unlinkErr) {
                // Non-critical if unlink fails
            }
        }
    }

    // Relative web URL path for the avatar
    const avatarUrl = `/uploads/avatars/${file.filename}`;

    await authModel.updateAvatarById(adminId, avatarUrl);

    const updated = await authModel.getAdminById(adminId);

    return {
        message: 'Avatar uploaded successfully',
        avatar: updated.avatar,
        admin: {
            id: updated.id,
            username: updated.username,
            email: updated.email,
            avatar: updated.avatar
        }
    };
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
    updateProfile,
    updateAvatar,
    logoutUser
};

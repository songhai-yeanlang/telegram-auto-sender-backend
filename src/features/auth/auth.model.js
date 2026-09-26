const { connection } = require('../../config/db.config');

const getUserByEmail = async (email) => {
    const [rows] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
};

const getUserById = async (id) => {
    const [rows] = await connection.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
};

const updatePasswordById = async (id, passwordHash) => {
    const [result] = await connection.query('UPDATE users SET password = ? WHERE id = ?', [passwordHash, id]);
    return result.affectedRows > 0;
};

const savePasswordResetOtp = async (email, otp, expiresAt) => {
    // Delete any existing OTP for this email
    await connection.query('DELETE FROM password_resets WHERE email = ?', [email]);
    await connection.query(
        'INSERT INTO password_resets (email, otp, expires_at) VALUES (?, ?, ?)',
        [email, otp, expiresAt]
    );
};

const getLatestPasswordResetOtp = async (email) => {
    const [rows] = await connection.query(
        'SELECT * FROM password_resets WHERE email = ? ORDER BY id DESC LIMIT 1',
        [email]
    );
    return rows[0];
};

const clearPasswordResetOtp = async (email) => {
    await connection.query('DELETE FROM password_resets WHERE email = ?', [email]);
};

const saveTokens = async (id, token, refreshToken, refreshTokenExpires) => {
    await connection.query(
        'UPDATE users SET token = ?, refresh_token = ?, refresh_token_expires = ? WHERE id = ?',
        [token, refreshToken, refreshTokenExpires, id]
    );
};

const clearTokens = async (id) => {
    await connection.query(
        'UPDATE users SET token = NULL, refresh_token = NULL, refresh_token_expires = NULL WHERE id = ?',
        [id]
    );
};

module.exports = {
    getUserByEmail,
    getUserById,
    updatePasswordById,
    savePasswordResetOtp,
    getLatestPasswordResetOtp,
    clearPasswordResetOtp,
    saveTokens,
    clearTokens
};

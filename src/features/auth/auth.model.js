const { connection } = require('../../config/db.config');

const getAdminByUsernameOrEmail = async (identifier) => {
    const [rows] = await connection.query(
        'SELECT * FROM admin_account WHERE username = ? OR email = ?',
        [identifier, identifier]
    );
    return rows[0];
};

const getAdminByEmail = async (email) => {
    const [rows] = await connection.query(
        'SELECT * FROM admin_account WHERE email = ?',
        [email]
    );
    return rows[0];
};

const getAdminByUsername = async (username) => {
    const [rows] = await connection.query(
        'SELECT * FROM admin_account WHERE username = ?',
        [username]
    );
    return rows[0];
};

const getAdminById = async (id) => {
    const [rows] = await connection.query(
        'SELECT * FROM admin_account WHERE id = ?',
        [id]
    );
    return rows[0];
};

const updateLastLogin = async (id) => {
    await connection.query(
        'UPDATE admin_account SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
        [id]
    );
};

const updatePasswordById = async (id, passwordHash) => {
    const [result] = await connection.query(
        'UPDATE admin_account SET password_hash = ?, reset_token = NULL, token_expires_at = NULL WHERE id = ?',
        [passwordHash, id]
    );
    return result.affectedRows > 0;
};

const saveResetToken = async (id, resetToken, expiresAt) => {
    await connection.query(
        'UPDATE admin_account SET reset_token = ?, token_expires_at = ? WHERE id = ?',
        [resetToken, expiresAt, id]
    );
};

const getAdminByResetToken = async (resetToken) => {
    const [rows] = await connection.query(
        'SELECT * FROM admin_account WHERE reset_token = ? AND token_expires_at > NOW()',
        [resetToken]
    );
    return rows[0];
};

const clearResetToken = async (id) => {
    await connection.query(
        'UPDATE admin_account SET reset_token = NULL, token_expires_at = NULL WHERE id = ?',
        [id]
    );
};

module.exports = {
    getAdminByUsernameOrEmail,
    getAdminByEmail,
    getAdminByUsername,
    getAdminById,
    updateLastLogin,
    updatePasswordById,
    saveResetToken,
    getAdminByResetToken,
    clearResetToken
};

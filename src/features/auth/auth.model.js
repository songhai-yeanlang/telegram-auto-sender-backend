const { connection } = require('../../config/db.config');

const getUserByUsername = async (username) => {
    const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
};

module.exports = {
    getUserByUsername
};

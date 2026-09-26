const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const env = require('../../config/env.config');
const authModel = require('./auth.model');
const { loginSchema } = require('./auth.validation');

const loginUser = async (body) => {
    // Validate request body
    const { error, value } = loginSchema.validate(body);
    if (error) {
        const validationError = new Error(error.details[0].message);
        validationError.statusCode = 400;
        throw validationError;
    }

    const { username, password } = value;

    // Check if user exists
    const user = await authModel.getUserByUsername(username);
    if (!user) {
        const authError = new Error('Invalid username or password');
        authError.statusCode = 401;
        throw authError;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
        const authError = new Error('Invalid username or password');
        authError.statusCode = 401;
        throw authError;
    }

    // Generate JWT token
    const token = jwt.sign(
        { id: user.id, username: user.username },
        env.jwtSecret,
        { expiresIn: '1d' }
    );

    return { token, user: { id: user.id, username: user.username } };
};

module.exports = {
    loginUser
};

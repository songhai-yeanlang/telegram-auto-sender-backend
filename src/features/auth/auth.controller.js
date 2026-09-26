const authService = require('./auth.service');
const logger = require('../../utils/logger.util');

const login = async (req, res, next) => {
    try {
        const result = await authService.loginUser(req.body);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: result
        });
    } catch (error) {
        logger.error(`[Login] Error: ${error.message}`);
        next(error);
    }
};

module.exports = {
    login
};

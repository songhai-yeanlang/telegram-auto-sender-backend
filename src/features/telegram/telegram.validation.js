const env = require('../../config/env.config');

const validateTelegramConfig = () => {
    if (!env.telegram.apiId || !env.telegram.apiHash) {
        throw new Error("Error env");
    }
};

module.exports = { validateTelegramConfig };
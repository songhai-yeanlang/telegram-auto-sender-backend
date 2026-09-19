const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const env = require('../../config/env.config');
const logger = require('../../utils/logger.util');
const { validateTelegramConfig } = require('./telegram.validation');

let globalClient = null;

const initClient = async () => {
    validateTelegramConfig();
    
    const stringSession = new StringSession(env.telegram.sessionString);
    const client = new TelegramClient(stringSession, env.telegram.apiId, env.telegram.apiHash, {
        connectionRetries: 5,
    });

    await client.start({
        phoneNumber: async () => await input.text("Phone Number: "),
        password: async () => await input.text("2FA Password: "),
        phoneCode: async () => await input.text("Telegram Verification Code: "),
        onError: (err) => logger.error("Telegram Login Error:", err),
    });

    logger.info("Telegram Login Success!");
    
 
    if (!env.telegram.sessionString) {
        logger.info("Here is your Session String (Copy to .env):");
        console.log(client.session.save());
    }

    globalClient = client;
    return client;
};

const getClient = () => {
    if (!globalClient) throw new Error("Telegram Client not connected!");
    return globalClient;
};

module.exports = { initClient, getClient };
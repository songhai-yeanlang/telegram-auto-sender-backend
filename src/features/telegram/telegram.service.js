const TelegramBot = require('node-telegram-bot-api');
const env = require('../../config/env.config');
const logger = require('../../utils/logger.util');
const ContactModel = require('../contacts/contact.model'); // Import Model to use

let bot = null;

const initBot = () => {
    if (!env.botToken) throw new Error("Missing BOT_TOKEN in .env");

    bot = new TelegramBot(env.botToken, { polling: true });
    logger.info("Telegram Bot connected successfully and waiting for messages...");

    // Listen for /start command from users
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id.toString(); // Convert to String to prevent errors
        const firstName = msg.chat.first_name || "User";
        
        logger.info(`Someone clicked Start! Name: ${firstName}, Chat ID is: ${chatId}`);
        
        try {
            // Automatically insert Chat ID into Database
            const result = await ContactModel.addContact(chatId);
            
            if (result.affectedRows > 0) {
                bot.sendMessage(chatId, `Hello ${firstName}! Your account has been saved successfully. You will receive a message when the broadcast starts.`);
            } else {
                bot.sendMessage(chatId, `Hello ${firstName}! Your account is already registered in the system.`);
            }
        } catch (error) {
            logger.error("Error saving Chat ID:", error);
            bot.sendMessage(chatId, "Sorry, we are experiencing technical difficulties.");
        }
    });

    return bot;
};

const getBot = () => {
    if (!bot) throw new Error("Bot is not connected yet!");
    return bot;
};

module.exports = { initBot, getBot };
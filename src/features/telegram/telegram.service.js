const TelegramBot = require('node-telegram-bot-api');
const env = require('../../config/env.config');
const logger = require('../../utils/logger.util');
const contactService = require('../contacts/contact.service'); // Import Service

let bot = null;

const initBot = () => {
    if (!env.botToken) throw new Error("Missing BOT_TOKEN in .env");

    bot = new TelegramBot(env.botToken, { 
        polling: true,
        request: {
            agentOptions: {
                keepAlive: true,
                family: 4 // Force IPv4 to fix EFATAL: AggregateError in newer Node versions
            }
        }
    });
    
    bot.on("polling_error", (err) => {
        logger.error(`Telegram Polling Error: ${err.message}`);
    });
    logger.info("Telegram Bot connected successfully and waiting for messages...");

    // Listen for /start command from users
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id.toString(); // Convert to String to prevent errors
        const firstName = msg.chat.first_name || '';
        const lastName = msg.chat.last_name || '';
        const name = `${firstName} ${lastName}`.trim() || null;
        const username = msg.chat.username || null;
        
        logger.info(`Someone clicked Start! Name: ${name || 'User'}, Chat ID is: ${chatId}`);
        
        try {
            // Automatically insert Chat ID and info into Database via Service layer
            const result = await contactService.addContactService(chatId, name, username);
            
            if (result.status === 201) {
                bot.sendMessage(chatId, `Hello ${name || 'User'}! Your account has been saved successfully. You will receive a message when the broadcast starts.`);
            } else {
                bot.sendMessage(chatId, `Hello ${name || 'User'}! Your account is already registered in the system.`);
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
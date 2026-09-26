const telegramService = require('../telegram/telegram.service');
const ContactModel = require('../contacts/contact.model');
const { randomDelay } = require('../../utils/delay.util');
const logger = require('../../utils/logger.util');

const startBroadcastService = async (messageText) => {
    try {
        const bot = telegramService.getBot();
        
        // Note: You must modify the Database Model to fetch chat_id instead of phone_number
        const pendingContacts = await ContactModel.getPendingContacts(200);

        if (pendingContacts.length === 0) {
            logger.info("No new phone numbers to send (Pending = 0).");
            return;
        }

        logger.info(`Starting to send messages to ${pendingContacts.length} numbers...`);

        for (let i = 0; i < pendingContacts.length; i++) {
            const chatId = pendingContacts[i].chat_id; // Use chat_id
            
            try {
                await bot.sendMessage(chatId, messageText);
                logger.info(`[${i + 1}/${pendingContacts.length}] Sent ${chatId} ✅`);
                
                await ContactModel.updateStatus(chatId, 'sent');
                await randomDelay(1, 3); // Bot can send faster now (Delay 1 to 3 seconds)
            } catch (error) {
                logger.error(`[${i + 1}/${pendingContacts.length}] Failed ${chatId}: ${error.message} ❌`);
                await ContactModel.updateStatus(chatId, 'failed', error.message);
            }
        }
        logger.info("Completed!");
    } catch (error) {
        logger.error("Error Broadcast:", error);
    }
};

module.exports = { startBroadcastService };
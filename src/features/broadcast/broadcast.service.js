const telegramService = require('../telegram/telegram.service');
const ContactModel = require('../contacts/contact.model');
const { randomDelay } = require('../../utils/delay.util');
const logger = require('../../utils/logger.util');

const startBroadcastService = async (messageText) => {
    try {
        const client = telegramService.getClient();
        const pendingContacts = await ContactModel.getPendingContacts(200);

        if (pendingContacts.length === 0) {
            logger.info("No new phone numbers to send (Pending = 0).");
            return;
        }

        logger.info(`Starting to send messages to ${pendingContacts.length} numbers...`);

        for (let i = 0; i < pendingContacts.length; i++) {
            const number = pendingContacts[i].phone_number;
            
            try {
                await client.sendMessage(number, { message: messageText });
                logger.info(`[${i + 1}/${pendingContacts.length}] Sent successfully to ${number} ✅`);
                await ContactModel.updateStatus(number, 'sent');

                if (i < pendingContacts.length - 1) {
                    await randomDelay(30, 60);
                }
            } catch (error) {
                logger.error(`[${i + 1}/${pendingContacts.length}] Failed to ${number}: ${error.message} ❌`);
                await ContactModel.updateStatus(number, 'failed', error.message);
                
                if (error.errorMessage && error.errorMessage.includes("FLOOD")) {
                    await randomDelay(180, 200); 
                } else {
                    await randomDelay(10, 20);
                }
            }
        }
        logger.info("Completed!");
    } catch (error) {
        logger.error("Error!");
    }
};

module.exports = { startBroadcastService };
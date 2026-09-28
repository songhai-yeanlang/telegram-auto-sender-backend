const telegramService = require('../telegram/telegram.service');
const ContactModel = require('../contacts/contact.model');
const { randomDelay } = require('../../utils/delay.util');
const logger = require('../../utils/logger.util');
const { Api } = require('telegram');

const startBroadcastService = async (messageText) => {
    try {
        const client = telegramService.getClient();
        
        const pendingContacts = await ContactModel.getPendingContacts(200);

        if (pendingContacts.length === 0) {
            logger.info("No new contacts to send (Pending = 0).");
            return;
        }

        logger.info(`Starting to send messages to ${pendingContacts.length} contacts...`);

        for (let i = 0; i < pendingContacts.length; i++) {
            const contact = pendingContacts[i];
            const chatId = contact.chat_id;
            
            try {
                // If it's a phone number, import it first to resolve the Peer
                if (chatId.startsWith('+')) {
                    logger.info(`[${i + 1}/${pendingContacts.length}] Importing contact ${chatId}...`);
                    await client.invoke(
                        new Api.contacts.ImportContacts({
                            contacts: [
                                new Api.InputPhoneContact({
                                    clientId: BigInt(Math.floor(Math.random() * 10000000)),
                                    phone: chatId,
                                    firstName: (contact.name && contact.name !== 'none') ? contact.name : chatId,
                                    lastName: '',
                                }),
                            ],
                        })
                    );
                }
                
                await client.sendMessage(chatId, { message: messageText });
                logger.info(`[${i + 1}/${pendingContacts.length}] Sent ${chatId} ✅`);
                
                await ContactModel.updateStatus(chatId, 'sent');
                
                // Random delay between 10 and 25 seconds for Personal Account safety
                await randomDelay(10, 25);
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
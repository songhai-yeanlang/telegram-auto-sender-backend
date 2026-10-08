const telegramService = require('../telegram/telegram.service');
const ContactModel = require('../contacts/contact.model');
const { randomDelay } = require('../../utils/delay.util');
const logger = require('../../utils/logger.util');
const { Api } = require('telegram');
const fs = require('fs');

let isBroadcasting = false;

const startBroadcastService = async (messageText, { contactIds, chatIds, imagePath } = {}) => {
    if (isBroadcasting) {
        logger.warn("[Broadcast] A broadcast job is already in progress. Please wait until it completes.");
        return;
    }

    isBroadcasting = true;

    try {
        const client = telegramService.getClient();
        
        let targetContacts = [];

        // Fetch contacts based on selected IDs or Chat IDs
        if (contactIds && Array.isArray(contactIds) && contactIds.length > 0) {
            targetContacts = await ContactModel.getContactsByIds(contactIds);
        } else if (chatIds && Array.isArray(chatIds) && chatIds.length > 0) {
            targetContacts = await ContactModel.getContactsByChatIds(chatIds);
        }

        if (targetContacts.length === 0) {
            logger.warn("No contacts found for the selected IDs.");
            isBroadcasting = false;
            return;
        }

        const hasImage = Boolean(imagePath && fs.existsSync(imagePath));
        logger.info(`Starting broadcast to ${targetContacts.length} contacts (${hasImage ? 'with image' : 'text only'})...`);

        for (let i = 0; i < targetContacts.length; i++) {
            const contact = targetContacts[i];
            const chatId = contact.chat_id;
            
            try {
                // If it's a phone number, import it first to resolve the Peer
                if (chatId.startsWith('+')) {
                    logger.info(`[${i + 1}/${targetContacts.length}] Importing contact ${chatId}...`);
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
                
                // Send with image if provided, otherwise send text
                if (hasImage) {
                    await client.sendFile(chatId, {
                        file: imagePath,
                        caption: messageText || '',
                        parseMode: 'html'
                    });
                } else {
                    await client.sendMessage(chatId, { 
                        message: messageText,
                        parseMode: 'html'
                    });
                }

                logger.info(`[${i + 1}/${targetContacts.length}] Sent ${chatId} ✅`);
                await ContactModel.updateStatus(chatId, 'sent');
                
                // Random delay between 10 and 25 seconds for Personal Account safety
                await randomDelay(10, 25);
            } catch (error) {
                logger.error(`[${i + 1}/${targetContacts.length}] Failed ${chatId}: ${error.message} ❌`);
                await ContactModel.updateStatus(chatId, 'failed', error.message);

                // Handle Telegram FloodWait if encountered
                if (error.seconds) {
                    logger.warn(`[Broadcast] Telegram requested FLOOD_WAIT: sleeping for ${error.seconds}s...`);
                    await randomDelay(error.seconds, error.seconds + 3);
                }
            }
        }
        logger.info("Broadcast to selected contacts completed!");
    } catch (error) {
        logger.error("Error Broadcast:", error);
    } finally {
        isBroadcasting = false;
    }
};

const isBroadcastRunning = () => isBroadcasting;

module.exports = { startBroadcastService, isBroadcastRunning };
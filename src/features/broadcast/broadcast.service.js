const telegramService = require('../telegram/telegram.service');
const ContactModel = require('../contacts/contact.model');
const BroadcastModel = require('./broadcast.model');
const { randomDelay } = require('../../utils/delay.util');
const logger = require('../../utils/logger.util');
const { Api } = require('telegram');
const fs = require('fs');
const cron = require('node-cron');

let isBroadcasting = false;

/**
 * Execute the internal broadcast loop in the background.
 * Returns false if another broadcast is already running (race condition guard).
 */
const executeBroadcastProcess = async ({ messageText, contactIds, chatIds, imagePath }) => {
    if (isBroadcasting) {
        logger.warn('[Broadcast] executeBroadcastProcess called while already broadcasting. Skipping.');
        return false;
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
            logger.warn("[Broadcast] No contacts found for the selected IDs.");
            return;
        }

        const hasImage = Boolean(imagePath && fs.existsSync(imagePath));
        logger.info(`[Broadcast] Starting broadcast to ${targetContacts.length} contacts (${hasImage ? 'with image' : 'text only'})...`);

        for (let i = 0; i < targetContacts.length; i++) {
            const contact = targetContacts[i];
            const chatId = contact.chat_id;

            try {
                let targetPeer = chatId;

                // If it's a phone number, import it first to resolve the Peer
                if (chatId.startsWith('+')) {
                    logger.info(`[Broadcast] [${i + 1}/${targetContacts.length}] Importing contact ${chatId}...`);
                    const importResult = await client.invoke(
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

                    // Check if this phone number is registered on Telegram
                    if (!importResult.users || importResult.users.length === 0) {
                        throw new Error('This phone number does not have a Telegram account or privacy settings prevent contact');
                    }

                    // Use the resolved Telegram user ID / entity directly to ensure message delivery
                    const importedUser = importResult.users[0];
                    targetPeer = importedUser.id || importedUser;
                }

                // Send with image if provided, otherwise send text
                if (hasImage) {
                    await client.sendFile(targetPeer, {
                        file: imagePath,
                        caption: messageText || '',
                        parseMode: 'html'
                    });
                } else {
                    await client.sendMessage(targetPeer, {
                        message: messageText || '',
                        parseMode: 'html'
                    });
                }

                logger.info(`[Broadcast] [${i + 1}/${targetContacts.length}] Sent ${chatId} ✅`);
                await ContactModel.updateStatus(chatId, 'sent', null);

                // Optional: remove temporary imported contact to keep personal account contact book clean
                if (chatId.startsWith('+')) {
                    try {
                        await client.invoke(new Api.contacts.DeleteContacts({ id: [targetPeer] }));
                    } catch (cleanErr) {
                        // Non-critical cleanup
                    }
                }

                // Random delay between 10 and 25 seconds for Personal Account safety
                await randomDelay(10, 25);
            } catch (error) {
                const errMsg = error.message || 'Cannot contact this account...';
                logger.error(`[Broadcast] [${i + 1}/${targetContacts.length}] Failed ${chatId}: ${errMsg} ❌`);
                await ContactModel.updateStatus(chatId, 'failed', errMsg);

                // If Telegram triggers PEER_FLOOD, the account is restricted by Telegram spam protection.
                // Stop immediately to protect remaining pending contacts and avoid a full account ban.
                if (errMsg.includes('PEER_FLOOD')) {
                    logger.error('[Broadcast] Telegram PEER_FLOOD restriction detected! Halting broadcast to protect your Telegram account.');
                    break;
                }

                // Handle Telegram FloodWait if encountered
                if (error.seconds) {
                    logger.warn(`[Broadcast] Telegram requested FLOOD_WAIT: sleeping for ${error.seconds}s...`);
                    await randomDelay(error.seconds, error.seconds + 3);
                } else {
                    // Safe cooling delay even on failed attempts to prevent Telegram spam rate-limits!
                    await randomDelay(5, 8);
                }
            }
        }
        logger.info("[Broadcast] Broadcast process completed successfully!");
    } catch (error) {
        logger.error("[Broadcast] Error during broadcast execution:", error);
        throw error;
    } finally {
        isBroadcasting = false;
    }
};

/**
 * Start immediate broadcast service with all business logic & validation.
 */
const startBroadcastService = async (param1, param2 = {}) => {
    let messageText = '';
    let contactIds = null;
    let chatIds = null;
    let imagePath = null;

    if (typeof param1 === 'object' && param1 !== null && !Array.isArray(param1)) {
        messageText = param1.message || param1.messageText || '';
        contactIds = param1.contactIds;
        chatIds = param1.chatIds;
        imagePath = param1.imagePath;
    } else {
        messageText = param1 || '';
        contactIds = param2.contactIds;
        chatIds = param2.chatIds;
        imagePath = param2.imagePath;
    }

    if (isBroadcasting) {
        return {
            status: 409,
            success: false,
            message: "A broadcast is already in progress. Please wait until it finishes."
        };
    }

    const hasImage = Boolean(imagePath && fs.existsSync(imagePath));
    if (!hasImage && (!messageText || !messageText.trim())) {
        return {
            status: 400,
            success: false,
            message: "Please provide either a message text or an image to broadcast."
        };
    }

    const hasContacts = (contactIds && contactIds.length > 0) || (chatIds && chatIds.length > 0);
    if (!hasContacts) {
        return {
            status: 400,
            success: false,
            message: "Please select at least one contact to send."
        };
    }

    // Trigger execution in background
    executeBroadcastProcess({
        messageText,
        contactIds,
        chatIds,
        imagePath
    }).catch(err => {
        logger.error("[Broadcast] Background broadcast execution error:", err);
    });

    return {
        status: 200,
        success: true,
        message: hasImage
            ? "Broadcast process with image started for selected contacts!"
            : "Broadcast process started for selected contacts!"
    };
};

/**
 * Check if a broadcast is currently running.
 */
const isBroadcastRunning = () => isBroadcasting;

/**
 * Status service for polling status.
 */
const getBroadcastStatusService = () => {
    return {
        status: 200,
        success: true,
        isBroadcasting: isBroadcasting
    };
};

/**
 * Schedule broadcast service with business logic & time validation.
 */
const scheduleBroadcastService = async (param1, param2 = {}) => {
    let messageText = '';
    let contactIds = null;
    let chatIds = null;
    let imagePath = null;
    let scheduledAt = null;

    if (typeof param1 === 'object' && param1 !== null && !Array.isArray(param1)) {
        messageText = param1.message || param1.messageText || '';
        contactIds = param1.contactIds;
        chatIds = param1.chatIds;
        imagePath = param1.imagePath;
        scheduledAt = param1.scheduledAt;
    } else {
        messageText = param1 || '';
        contactIds = param2.contactIds;
        chatIds = param2.chatIds;
        imagePath = param2.imagePath;
        scheduledAt = param2.scheduledAt;
    }

    const hasImage = Boolean(imagePath && fs.existsSync(imagePath));
    if (!hasImage && (!messageText || !messageText.trim())) {
        return {
            status: 400,
            success: false,
            message: "Please provide either a message text or an image to broadcast."
        };
    }

    if (!scheduledAt) {
        return {
            status: 400,
            success: false,
            message: "Please provide a scheduled time (scheduledAt)."
        };
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
        return {
            status: 400,
            success: false,
            message: "Invalid scheduled date/time format."
        };
    }

    if (scheduledDate.getTime() <= Date.now()) {
        return {
            status: 400,
            success: false,
            message: "Scheduled time must be in the future."
        };
    }

    const targetIds = (contactIds && contactIds.length > 0) ? contactIds : chatIds;
    if (!targetIds || targetIds.length === 0) {
        return {
            status: 400,
            success: false,
            message: "Please select at least one contact for scheduled broadcast."
        };
    }

    await BroadcastModel.addScheduledBroadcast({
        messageText: messageText || '',
        imagePath: imagePath || null,
        targetType: 'selected',
        targetIds,
        scheduledAt: scheduledDate
    });

    return {
        status: 201,
        success: true,
        message: "Broadcast scheduled successfully!"
    };
};

/**
 * Get all scheduled broadcasts formatted for UI display.
 */
const getScheduledBroadcastsService = async () => {
    const jobs = await BroadcastModel.getScheduledBroadcasts();
    const formatted = jobs.map(job => {
        let parsedTargetIds = [];
        try {
            parsedTargetIds = typeof job.target_ids === 'string' ? JSON.parse(job.target_ids) : (job.target_ids || []);
        } catch {
            parsedTargetIds = [];
        }
        return {
            ...job,
            target_ids: parsedTargetIds,
            total_recipients: Array.isArray(parsedTargetIds) ? parsedTargetIds.length : 0
        };
    });

    return {
        status: 200,
        success: true,
        data: formatted
    };
};

/**
 * Delete a scheduled broadcast job with verification and cleanup.
 */
const deleteScheduledBroadcastService = async (id) => {
    const job = await BroadcastModel.getScheduledBroadcastById(id);
    if (!job) {
        return {
            status: 404,
            success: false,
            message: "Scheduled broadcast not found."
        };
    }

    if (job.status === 'processing') {
        return {
            status: 400,
            success: false,
            message: "Cannot delete a scheduled broadcast that is currently processing."
        };
    }

    await BroadcastModel.deleteScheduledBroadcast(id);

    // If an image was associated with this schedule, cleanup file safely
    if (job.image_path && fs.existsSync(job.image_path)) {
        try {
            fs.unlinkSync(job.image_path);
        } catch (e) {
            logger.warn(`[Broadcast] Could not delete image file: ${e.message}`);
        }
    }

    return {
        status: 200,
        success: true,
        message: "Scheduled broadcast deleted successfully!"
    };
};

/**
 * Cron job to process scheduled broadcasts every minute.
 */
const processScheduledBroadcasts = async () => {
    if (isBroadcasting) return; // Skip if another broadcast is running

    try {
        const pendingJobs = await BroadcastModel.getPendingBroadcastsBeforeNow();
        if (pendingJobs && pendingJobs.length > 0) {
            const job = pendingJobs[0];
            logger.info(`[Broadcast Cron] Starting scheduled broadcast job #${job.id}`);

            await BroadcastModel.updateBroadcastStatus(job.id, 'processing');

            let contactIds = null;
            let chatIds = null;

            if (job.target_ids) {
                try {
                    const ids = typeof job.target_ids === 'string' ? JSON.parse(job.target_ids) : job.target_ids;
                    if (Array.isArray(ids) && ids.length > 0 && typeof ids[0] === 'string') {
                        chatIds = ids;
                    } else {
                        contactIds = ids;
                    }
                } catch {
                    contactIds = job.target_ids;
                }
            }

            try {
                await executeBroadcastProcess({
                    messageText: job.message_text,
                    contactIds,
                    chatIds,
                    imagePath: job.image_path
                });

                await BroadcastModel.updateBroadcastStatus(job.id, 'completed');
                logger.info(`[Broadcast Cron] Completed scheduled broadcast job #${job.id}`);
            } catch (jobError) {
                logger.error(`[Broadcast Cron] Job #${job.id} failed: ${jobError.message}`);
                await BroadcastModel.updateBroadcastStatus(job.id, 'failed');
            }
        }
    } catch (error) {
        logger.error(`[Broadcast Cron] Error processing scheduled broadcasts: ${error.message}`);
    }
};

cron.schedule('* * * * *', processScheduledBroadcasts);

module.exports = {
    startBroadcastService,
    isBroadcastRunning,
    getBroadcastStatusService,
    scheduleBroadcastService,
    getScheduledBroadcastsService,
    deleteScheduledBroadcastService,
    // Keep backward-compatible names
    getScheduledBroadcasts: getScheduledBroadcastsService,
    deleteScheduledBroadcast: deleteScheduledBroadcastService
};
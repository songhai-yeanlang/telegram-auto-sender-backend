const db = require('../../config/db.config');

const ContactModel = {
    addContact: async (chatId, name = null, username = null) => {
        const [result] = await db.connection.execute(
            "INSERT IGNORE INTO telegram_contacts (chat_id, name, username, status) VALUES (?, ?, ?, 'pending')",
            [chatId, name, username]
        );
        return result;
    },

    getPendingContacts: async (limit = 200) => {

        const [rows] = await db.connection.execute(
            "SELECT chat_id FROM telegram_contacts WHERE status = 'pending' LIMIT ?",
            [limit]
        );
        return rows;
    },

    updateStatus: async (chatId, status, errorMessage = null) => {
        // Update status to sent or failed based on actual result
        await db.connection.execute(
            "UPDATE telegram_contacts SET status = ?, error_message = ? WHERE chat_id = ?",
            [status, errorMessage, chatId]
        );
    },

    getAllContacts: async () => {
        const [rows] = await db.connection.execute(
            "SELECT * FROM telegram_contacts ORDER BY created_at DESC"
        );
        return rows;
    }
};

module.exports = ContactModel;
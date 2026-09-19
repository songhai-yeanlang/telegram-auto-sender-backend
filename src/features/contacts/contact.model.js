const db = require('../../config/db.config');

const ContactModel = {
    addContact: async (chatId) => {
        // បញ្ជូល chat_id ថ្មីដោយមានស្ថានភាព pending
        const [result] = await db.connection.execute(
            "INSERT IGNORE INTO telegram_contacts (chat_id, status) VALUES (?, 'pending')",
            [chatId]
        );
        return result;
    },

    getPendingContacts: async (limit = 200) => {
        // ទាញយកតែ chat_id ណាដែលមិនទាន់បានផ្ញើសារ
        const [rows] = await db.connection.execute(
            "SELECT chat_id FROM telegram_contacts WHERE status = 'pending' LIMIT ?",
            [limit]
        );
        return rows;
    },

    updateStatus: async (chatId, status, errorMessage = null) => {
        // Update ស្ថានភាពទៅជា sent ឬ failed ទៅតាមលទ្ធផលជាក់ស្ដែង
        await db.connection.execute(
            "UPDATE telegram_contacts SET status = ?, error_message = ? WHERE chat_id = ?",
            [status, errorMessage, chatId]
        );
    }
};

module.exports = ContactModel;
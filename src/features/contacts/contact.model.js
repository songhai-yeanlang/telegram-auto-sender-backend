const db = require('../../config/db.config');

const ContactModel = {
    addContact: async (phoneNumber) => {
        const [result] = await db.connection.execute(
            "INSERT IGNORE INTO telegram_contacts (phone_number, status) VALUES (?, 'pending')",
            [phoneNumber]
        );
        return result;
    },
    getPendingContacts: async (limit = 200) => {
        const [rows] = await db.connection.execute(
            "SELECT phone_number FROM telegram_contacts WHERE status = 'pending' LIMIT ?",
            [limit]
        );
        return rows;
    },
    updateStatus: async (phoneNumber, status, errorMessage = null) => {
        await db.connection.execute(
            "UPDATE telegram_contacts SET status = ?, error_message = ? WHERE phone_number = ?",
            [status, errorMessage, phoneNumber]
        );
    }
};

module.exports = ContactModel;
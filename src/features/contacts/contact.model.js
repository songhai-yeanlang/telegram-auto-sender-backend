const db = require('../../config/db.config');

const ContactModel = {
    addContact: async (chatId, name = 'none') => {
        const [result] = await db.connection.execute(
            "INSERT IGNORE INTO telegram_contacts (chat_id, name, status) VALUES (?, ?, 'pending')",
            [chatId, name || 'none']
        );
        return result;
    },

    bulkAddContacts: async (contactsData) => {
        if (!contactsData || contactsData.length === 0) return { affectedRows: 0 };
        // contactsData should be an array of arrays: [[chatId, name, status], ...]
        const [result] = await db.connection.query(
            "INSERT IGNORE INTO telegram_contacts (chat_id, name, status) VALUES ?",
            [contactsData]
        );
        return result;
    },

    getPendingContacts: async (limit = 200) => {
        const [rows] = await db.connection.execute(
            "SELECT chat_id, name FROM telegram_contacts WHERE status = 'pending' LIMIT ?",
            [limit]
        );
        return rows;
    },

    getContactsByIds: async (ids) => {
        if (!ids || ids.length === 0) return [];
        const placeholders = ids.map(() => '?').join(',');
        const [rows] = await db.connection.query(
            `SELECT id, chat_id, name, status FROM telegram_contacts WHERE id IN (${placeholders})`,
            ids
        );
        return rows;
    },

    getContactsByChatIds: async (chatIds) => {
        if (!chatIds || chatIds.length === 0) return [];
        const placeholders = chatIds.map(() => '?').join(',');
        const [rows] = await db.connection.query(
            `SELECT id, chat_id, name, status FROM telegram_contacts WHERE chat_id IN (${placeholders})`,
            chatIds
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
    },

    getContactById: async (id) => {
        const [rows] = await db.connection.execute(
            "SELECT * FROM telegram_contacts WHERE id = ?",
            [id]
        );
        return rows[0] || null;
    },

    updateContactById: async (id, updateFields) => {
        const fields = [];
        const values = [];

        if (updateFields.chat_id !== undefined) {
            fields.push('chat_id = ?');
            values.push(updateFields.chat_id);
        }
        if (updateFields.name !== undefined) {
            fields.push('name = ?');
            values.push(updateFields.name);
        }
        if (updateFields.status !== undefined) {
            fields.push('status = ?');
            values.push(updateFields.status);
        }
        if (updateFields.error_message !== undefined) {
            fields.push('error_message = ?');
            values.push(updateFields.error_message);
        }

        if (fields.length === 0) return { affectedRows: 0 };

        values.push(id);
        const [result] = await db.connection.execute(
            `UPDATE telegram_contacts SET ${fields.join(', ')} WHERE id = ?`,
            values
        );
        return result;
    },

    deleteContactById: async (id) => {
        const [result] = await db.connection.execute(
            "DELETE FROM telegram_contacts WHERE id = ?",
            [id]
        );
        return result;
    }
};

module.exports = ContactModel;
const { connection } = require('../../config/db.config');

const addContact = async (chatId, name) => {
    const [result] = await connection.query(
        'INSERT IGNORE INTO telegram_contacts (chat_id, name) VALUES (?, ?)',
        [chatId, name]
    );
    return result;
};

const bulkAddContacts = async (contactsData) => {
    // contactsData is an array of arrays: [[chatId, name, 'pending'], ...]
    const [result] = await connection.query(
        'INSERT IGNORE INTO telegram_contacts (chat_id, name, status) VALUES ?',
        [contactsData]
    );
    return result;
};

const getAllContacts = async () => {
    const [rows] = await connection.query(
        'SELECT * FROM telegram_contacts ORDER BY id DESC'
    );
    return rows;
};

const updateStatus = async (chatId, status) => {
    const [result] = await connection.query(
        'UPDATE telegram_contacts SET status = ? WHERE chat_id = ?',
        [status, chatId]
    );
    return result;
};

const getContactById = async (id) => {
    const [rows] = await connection.query(
        'SELECT * FROM telegram_contacts WHERE id = ?',
        [id]
    );
    return rows[0];
};

const updateContactById = async (id, fieldsToUpdate) => {
    const setClauses = [];
    const values = [];
    
    for (const key in fieldsToUpdate) {
        setClauses.push(`${key} = ?`);
        values.push(fieldsToUpdate[key]);
    }
    
    if (setClauses.length === 0) return null;
    
    values.push(id);
    const sql = `UPDATE telegram_contacts SET ${setClauses.join(', ')} WHERE id = ?`;
    const [result] = await connection.query(sql, values);
    return result;
};

const deleteContactById = async (id) => {
    const [result] = await connection.query(
        'DELETE FROM telegram_contacts WHERE id = ?',
        [id]
    );
    return result;
};

const deleteContactsByIds = async (ids) => {
    const [result] = await connection.query(
        'DELETE FROM telegram_contacts WHERE id IN (?)',
        [ids]
    );
    return result;
};

module.exports = {
    addContact,
    bulkAddContacts,
    getAllContacts,
    updateStatus,
    getContactById,
    updateContactById,
    deleteContactById,
    deleteContactsByIds
};

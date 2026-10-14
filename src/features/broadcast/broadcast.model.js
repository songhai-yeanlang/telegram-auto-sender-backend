const { connection } = require('../../config/db.config');

const addScheduledBroadcast = async (data) => {
    const { messageText, imagePath, targetType, targetIds, scheduledAt } = data;
    
    // Store targetIds as JSON string
    const targetIdsJson = targetIds ? JSON.stringify(targetIds) : null;
    
    const [result] = await connection.query(
        'INSERT INTO broadcast_scheduled (message_text, image_path, target_type, target_ids, scheduled_at, status) VALUES (?, ?, ?, ?, ?, ?)',
        [messageText, imagePath, targetType, targetIdsJson, scheduledAt, 'pending']
    );
    return result;
};

const getScheduledBroadcasts = async () => {
    const [rows] = await connection.query(
        'SELECT * FROM broadcast_scheduled ORDER BY scheduled_at ASC'
    );
    return rows;
};

const getPendingBroadcastsBeforeNow = async () => {
    const now = new Date();
    const [rows] = await connection.query(
        'SELECT * FROM broadcast_scheduled WHERE status = "pending" AND (scheduled_at <= ? OR scheduled_at <= NOW())',
        [now]
    );
    return rows;
};

const updateBroadcastStatus = async (id, status) => {
    const [result] = await connection.query(
        'UPDATE broadcast_scheduled SET status = ? WHERE id = ?',
        [status, id]
    );
    return result;
};

const getScheduledBroadcastById = async (id) => {
    const [rows] = await connection.query(
        'SELECT * FROM broadcast_scheduled WHERE id = ?',
        [id]
    );
    return rows[0] || null;
};

const deleteScheduledBroadcast = async (id) => {
    const [result] = await connection.query(
        'DELETE FROM broadcast_scheduled WHERE id = ?',
        [id]
    );
    return result;
};

module.exports = {
    addScheduledBroadcast,
    getScheduledBroadcasts,
    getScheduledBroadcastById,
    getPendingBroadcastsBeforeNow,
    updateBroadcastStatus,
    deleteScheduledBroadcast
};

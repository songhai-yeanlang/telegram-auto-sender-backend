const broadcastService = require('./broadcast.service');

const startBroadcast = async (req, res, next) => {
    try {
        const { message, contactIds, chatIds } = req.body;
        
        broadcastService.startBroadcastService(message, { contactIds, chatIds });

        return res.status(200).json({ 
            success: true, 
            message: "Broadcast process started for selected contacts!" 
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { startBroadcast };
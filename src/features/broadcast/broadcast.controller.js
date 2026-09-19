const broadcastService = require('./broadcast.service');

const startBroadcast = async (req, res, next) => {
    try {
        const messageText = req.body.message || "Hello! This is a message sent from the automatic system.";
        
        // Run in Background
        broadcastService.startBroadcastService(messageText);

        return res.status(200).json({ 
            success: true, 
            message: "Starting! Check Console or Database." 
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { startBroadcast };
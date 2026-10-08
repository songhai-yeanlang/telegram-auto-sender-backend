const broadcastService = require('./broadcast.service');

const startBroadcast = async (req, res, next) => {
    try {
        if (broadcastService.isBroadcastRunning && broadcastService.isBroadcastRunning()) {
            return res.status(409).json({
                success: false,
                message: "A broadcast is already in progress. Please wait until it finishes."
            });
        }

        const { message, contactIds, chatIds } = req.body;
        const imagePath = req.file ? req.file.path : null;

        if (!imagePath && (!message || !message.trim())) {
            return res.status(400).json({
                success: false,
                message: "Please provide either a message text or an image to broadcast."
            });
        }

        broadcastService.startBroadcastService(message || '', { 
            contactIds, 
            chatIds, 
            imagePath 
        });

        return res.status(200).json({ 
            success: true, 
            message: imagePath 
                ? "Broadcast process with image started for selected contacts!" 
                : "Broadcast process started for selected contacts!" 
        });
    } catch (error) {
        next(error);
    }
};

const getBroadcastStatus = (req, res) => {
    return res.status(200).json({
        success: true,
        isBroadcasting: broadcastService.isBroadcastRunning ? broadcastService.isBroadcastRunning() : false
    });
};

module.exports = { startBroadcast, getBroadcastStatus };
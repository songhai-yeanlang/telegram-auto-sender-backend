const broadcastService = require('./broadcast.service');

const startBroadcast = async (req, res, next) => {
    try {
        const { message, contactIds, chatIds } = req.body;
        const imagePath = req.file ? req.file.path : null;

        const result = await broadcastService.startBroadcastService({
            message,
            contactIds,
            chatIds,
            imagePath
        });

        return res.status(result.status).json({
            success: result.success,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const getBroadcastStatus = (req, res, next) => {
    try {
        const result = broadcastService.getBroadcastStatusService();
        return res.status(result.status).json({
            success: result.success,
            isBroadcasting: result.isBroadcasting
        });
    } catch (error) {
        next(error);
    }
};

const scheduleBroadcast = async (req, res, next) => {
    try {
        const { message, contactIds, chatIds, scheduledAt } = req.body;
        const imagePath = req.file ? req.file.path : null;

        const result = await broadcastService.scheduleBroadcastService({
            message,
            contactIds,
            chatIds,
            imagePath,
            scheduledAt
        });

        return res.status(result.status).json({
            success: result.success,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

const getScheduledBroadcasts = async (req, res, next) => {
    try {
        const result = await broadcastService.getScheduledBroadcastsService();
        return res.status(result.status).json({
            success: result.success,
            data: result.data
        });
    } catch (error) {
        next(error);
    }
};

const deleteScheduledBroadcast = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await broadcastService.deleteScheduledBroadcastService(id);
        return res.status(result.status).json({
            success: result.success,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    startBroadcast,
    getBroadcastStatus,
    scheduleBroadcast,
    getScheduledBroadcasts,
    deleteScheduledBroadcast
};
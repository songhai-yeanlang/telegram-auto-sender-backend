const express = require('express');
const router = express.Router();
const broadcastController = require('./broadcast.controller');
const validate = require('../../middlewares/validate');
const { broadcastSchema, scheduleBroadcastSchema } = require('./broadcast.validation');
const { isLogin } = require('../auth/auth.middleware');
const broadcastUpload = require('../../middlewares/broadcastUpload.middleware');

router.get('/status', isLogin, broadcastController.getBroadcastStatus);
router.post('/start', isLogin, broadcastUpload, validate(broadcastSchema), broadcastController.startBroadcast);
router.post('/schedule', isLogin, broadcastUpload, validate(scheduleBroadcastSchema), broadcastController.scheduleBroadcast);
router.get('/scheduled', isLogin, broadcastController.getScheduledBroadcasts);
router.delete('/scheduled/:id', isLogin, broadcastController.deleteScheduledBroadcast);

module.exports = router;

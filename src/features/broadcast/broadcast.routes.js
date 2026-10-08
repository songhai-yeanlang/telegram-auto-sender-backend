const express = require('express');
const router = express.Router();
const broadcastController = require('./broadcast.controller');
const validate = require('../../middlewares/validate');
const { broadcastSchema } = require('./broadcast.validation');
const { isLogin } = require('../auth/auth.middleware');
const broadcastUpload = require('../../middlewares/broadcastUpload.middleware');

router.get('/status', isLogin, broadcastController.getBroadcastStatus);
router.post('/start', isLogin, broadcastUpload, validate(broadcastSchema), broadcastController.startBroadcast);

module.exports = router;

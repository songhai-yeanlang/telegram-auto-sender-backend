const express = require('express');
const router = express.Router();
const broadcastController = require('./broadcast.controller');
const { isLogin } = require('../auth/auth.middleware');

router.post('/start', isLogin, broadcastController.startBroadcast);

module.exports = router;
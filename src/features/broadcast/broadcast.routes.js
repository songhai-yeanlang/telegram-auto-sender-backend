const express = require('express');
const router = express.Router();
const broadcastController = require('./broadcast.controller');

router.post('/start', broadcastController.startBroadcast);

module.exports = router;
const express = require('express');
const router = express.Router();
const broadcastController = require('./broadcast.controller');
const validate = require('../../middlewares/validate');
const { broadcastSchema } = require('./broadcast.validation');
const { isLogin } = require('../auth/auth.middleware');

router.post('/start', isLogin, validate(broadcastSchema), broadcastController.startBroadcast);

module.exports = router;

const express = require('express');
const router = express.Router();
const contactController = require('./contact.controller');
const validate = require('../../middlewares/validate');
const { createContactSchema, updateContactSchema, updateContactByIdSchema } = require('./contact.validation');
const upload = require('../../middlewares/upload.middleware');
const { isLogin } = require('../auth/auth.middleware');

router.get('/getAll', isLogin, contactController.getAllContacts);
router.post('/add', isLogin, validate(createContactSchema), contactController.createContact);
router.put('/updateStatus/:chatId', isLogin, validate(updateContactSchema), contactController.updateStatus);
router.post('/upload', isLogin, upload.single('file'), contactController.uploadContactsFile);
router.put('/update/:id', isLogin, validate(updateContactByIdSchema), contactController.updateContact);

module.exports = router;


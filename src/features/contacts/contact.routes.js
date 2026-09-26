const express = require('express');
const router = express.Router();
const contactController = require('./contact.controller');
const validate = require('../../middlewares/validate');
const { createContactSchema, updateContactSchema } = require('./contact.validation');
const upload = require('../../middlewares/upload.middleware');

router.post('/', validate(createContactSchema), contactController.createContact);
router.post('/upload', upload.single('file'), contactController.uploadContactsFile);
router.get('/getAll', contactController.getAllContacts);
router.put('/updateStatus/:chatId', validate(updateContactSchema), contactController.updateStatus);

module.exports = router;
const express = require('express');
const router = express.Router();
const contactController = require('./contact.controller');
const validate = require('../../middlewares/validate');
const { createContactSchema, updateContactSchema } = require('./contact.validation');

router.post('/', validate(createContactSchema), contactController.createContact);
router.get('/getAll', contactController.getAllContacts);
router.put('/updateStatus/:chatId', validate(updateContactSchema), contactController.updateStatus);
module.exports = router;
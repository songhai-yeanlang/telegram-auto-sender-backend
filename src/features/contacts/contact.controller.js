const contactService = require('./contact.service');
const { createContactSchema } = require('./contact.validation');

const createContact = async (req, res, next) => {
    try {
        const { error, value } = createContactSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        // បញ្ជូន chatId ទៅកាន់ Service
        const result = await contactService.addContactService(value.chatId);

        if (result.affectedRows === 0) {
            return res.status(409).json({ success: false, message: "Chat ID នេះមានរួចហើយនៅក្នុងប្រព័ន្ធ!" });
        }

        return res.status(201).json({ success: true, message: "បញ្ជូល Chat ID បានជោគជ័យ!" });
    } catch (error) {
        next(error);
    }
};

module.exports = { createContact };
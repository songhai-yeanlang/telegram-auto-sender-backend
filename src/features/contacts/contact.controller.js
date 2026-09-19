const contactService = require('./contact.service');
const { createContactSchema } = require('./contact.validation');

const createContact = async (req, res, next) => {
    try {
        const { error, value } = createContactSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ success: false, message: error.details[0].message });
        }

        const result = await contactService.addContactService(value.phoneNumber);

        if (result.affectedRows === 0) {
            return res.status(409).json({ success: false, message: "The phone number is already in the system!" });
        }

        return res.status(201).json({ success: true, message: "Phone number added successfully!" });
    } catch (error) {
        next(error);
    }
};

module.exports = { createContact };
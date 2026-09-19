const contactService = require('./contact.service');


const createContact = async (req, res, next) => {
    try {
        const result = await contactService.addContactService(req.body.chatId);
        return res.status(result.status).json({ success: result.success, message: result.message });
    } catch (error) {
        next(error);
    }
};

const getAllContacts = async (req, res, next) => {
    try {
        const result = await contactService.getAllContactsService();
        return res.status(result.status).json({ success: result.success, data: result.data });
    } catch (error) {
        next(error);
    }
};

const updateStatus = async (req, res, next) => {
    try {
        const result = await contactService.updateContactStatusService(req.body.chatId, req.body.status);
        return res.status(result.status).json({ success: result.success, message: result.message });
    } catch (error) {
        next(error);
    }
};

module.exports = { createContact, getAllContacts, updateStatus };
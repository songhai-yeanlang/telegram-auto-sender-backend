const contactService = require('./contact.service');

const createContact = async (req, res, next) => {
    try {
        const { chatId, name, username } = req.body;
        const result = await contactService.addContactService(chatId, name, username);
        return res.status(result.status).json({ success: result.success, message: result.message });
    } catch (error) {
        next(error);
    }
};

const uploadContactsFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded." });
        }
        
        const result = await contactService.uploadContactsFileService(req.file.buffer, req.file.originalname);
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
        const chatId = req.params.chatId || req.body.chatId;
        const result = await contactService.updateContactStatusService(chatId, req.body.status);
        return res.status(result.status).json({ success: result.success, message: result.message });
    } catch (error) {
        next(error);
    }
};

module.exports = { createContact, uploadContactsFile, getAllContacts, updateStatus };
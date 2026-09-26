const ContactModel = require('./contact.model');

const addContactService = async (chatId, name = null, username = null) => {
    const result = await ContactModel.addContact(chatId, name, username);
    if (result.affectedRows === 0) {
        return { status: 409, success: false, message: "Chat ID is already in the system!" };
    }
    return { status: 201, success: true, message: "Chat ID inserted successfully!" };
};

const getAllContactsService = async () => {
    const contacts = await ContactModel.getAllContacts();
    return { status: 200, success: true, data: contacts };
};

const updateContactStatusService = async (chatId, status) => {
    await ContactModel.updateStatus(chatId, status);
    return { status: 200, success: true, message: "Status updated successfully!" };
};

module.exports = { addContactService, getAllContactsService, updateContactStatusService };
const ContactModel = require('./contact.model');

const addContactService = async (chatId) => {
    const result = await ContactModel.addContact(chatId);
    if (result.affectedRows === 0) {
        return { status: 409, success: false, message: "Chat ID នេះមានរួចហើយនៅក្នុងប្រព័ន្ធ!" };
    }
    return { status: 201, success: true, message: "បញ្ជូល Chat ID បានជោគជ័យ!" };
};

const getAllContactsService = async () => {
    const contacts = await ContactModel.getAllContacts();
    return { status: 200, success: true, data: contacts };
};

const updateContactStatusService = async (chatId, status) => {
    await ContactModel.updateStatus(chatId, status);
    return { status: 200, success: true, message: "កែប្រែស្ថានភាពជោគជ័យ!" };
};

module.exports = { addContactService, getAllContactsService, updateContactStatusService };
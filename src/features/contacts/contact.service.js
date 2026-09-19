const ContactModel = require('./contact.model');

const addContactService = async (phoneNumber) => {
    return await ContactModel.addContact(phoneNumber);
};

module.exports = { addContactService };
const ContactModel = require('./contact.model');
const xlsx = require('xlsx');

// Helper function to format phone numbers
const formatPhoneNumber = (phone) => {
    if (!phone) return null;
    let cleaned = phone.toString().trim().replace(/[\s\-]/g, '');
    
    // Check if it looks like a username
    if (cleaned.startsWith('@') || isNaN(Number(cleaned.replace('+', '')))) {
        return cleaned; 
    }
    
    // Handle Cambodian local numbers
    if (cleaned.startsWith('0')) {
        cleaned = '+855' + cleaned.substring(1);
    } else if (cleaned.startsWith('855')) {
        cleaned = '+' + cleaned;
    } else if (!cleaned.startsWith('+')) {
        // Assume it might need a + if it's purely numeric
        cleaned = '+' + cleaned;
    }
    return cleaned;
};

const addContactService = async (chatId, name = null, username = null) => {
    const formattedChatId = formatPhoneNumber(chatId);
    const result = await ContactModel.addContact(formattedChatId, name, username);
    if (result.affectedRows === 0) {
        return { status: 409, success: false, message: "Chat ID is already in the system!" };
    }
    return { status: 201, success: true, message: "Chat ID inserted successfully!" };
};

const uploadContactsFileService = async (fileBuffer, originalname) => {
    try {
        let contactsData = [];
        const fileExtension = originalname.split('.').pop().toLowerCase();
        
        if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
            
            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                if (!row || row.length === 0) continue;
                
                let chatId = row[0];
                if (!chatId) continue;
                
                chatId = formatPhoneNumber(chatId);
                const name = row[1] ? row[1].toString().trim() : null;
                const username = row[2] ? row[2].toString().trim() : null;
                
                contactsData.push([chatId, name, username, 'pending']);
            }
        } else if (fileExtension === 'csv' || fileExtension === 'txt') {
            const content = fileBuffer.toString('utf-8');
            const lines = content.split(/\r?\n/);
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const parts = line.split(',');
                let chatId = parts[0];
                if (!chatId) continue;
                
                chatId = formatPhoneNumber(chatId);
                const name = parts[1] ? parts[1].trim() : null;
                const username = parts[2] ? parts[2].trim() : null;
                
                contactsData.push([chatId, name, username, 'pending']);
            }
        }
        
        if (contactsData.length === 0) {
            return { status: 400, success: false, message: "No valid contacts found in the file." };
        }
        
        const result = await ContactModel.bulkAddContacts(contactsData);
        return { status: 201, success: true, message: `Successfully processed file. Inserted ${result.affectedRows} new contacts.` };
        
    } catch (error) {
        console.error("Error processing file:", error);
        return { status: 500, success: false, message: "Failed to process the uploaded file." };
    }
};

const getAllContactsService = async () => {
    const contacts = await ContactModel.getAllContacts();
    return { status: 200, success: true, data: contacts };
};

const updateContactStatusService = async (chatId, status) => {
    await ContactModel.updateStatus(chatId, status);
    return { status: 200, success: true, message: "Status updated successfully!" };
};

module.exports = { addContactService, uploadContactsFileService, getAllContactsService, updateContactStatusService };
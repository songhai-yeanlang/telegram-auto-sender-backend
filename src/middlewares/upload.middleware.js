const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for specific formats
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'text/csv', // .csv
        'text/plain' // .txt
    ];
    
    // Sometimes CSV or TXT might come with different mime types, so checking the extension is also a good practice
    const allowedExtensions = /\.(xlsx|csv|txt)$/i;

    if (allowedMimeTypes.includes(file.mimetype) || file.originalname.match(allowedExtensions)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only .xlsx, .csv, and .txt files are allowed.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

module.exports = upload;

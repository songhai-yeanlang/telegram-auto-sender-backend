const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure broadcast uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads/broadcast');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `broadcast-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    const allowedExts = /\.(jpe?g|png|webp|gif|svg)$/i;

    if (allowedMimes.includes(file.mimetype) || file.originalname.match(allowedExts)) {
        cb(null, true);
    } else {
        const err = new Error('Invalid file type. Only image files (JPEG, PNG, WEBP, GIF, SVG) are allowed.');
        err.statusCode = 400;
        cb(err, false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB max
    }
});

/**
 * Middleware to handle optional broadcast image upload.
 * Also parses stringified array fields (contactIds, chatIds) commonly sent by multipart/form-data.
 */
const broadcastUpload = (req, res, next) => {
    upload.any()(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'Image size too large. Maximum allowed size is 10MB.'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message || 'Image upload error.'
            });
        }

        // Attach single file to req.file if uploaded
        if (req.files && req.files.length > 0) {
            const matchedFile = req.files.find(f => ['image', 'file', 'photo'].includes(f.fieldname)) || req.files[0];
            req.file = matchedFile;
        }

        // Parse contactIds if received as JSON string or comma-separated string from FormData
        if (typeof req.body.contactIds === 'string') {
            try {
                req.body.contactIds = JSON.parse(req.body.contactIds);
            } catch {
                if (req.body.contactIds.includes(',')) {
                    req.body.contactIds = req.body.contactIds
                        .split(',')
                        .map(item => Number(item.trim()))
                        .filter(item => !isNaN(item));
                } else if (!isNaN(Number(req.body.contactIds.trim()))) {
                    req.body.contactIds = [Number(req.body.contactIds.trim())];
                }
            }
        }

        // Parse chatIds if received as JSON string or comma-separated string from FormData
        if (typeof req.body.chatIds === 'string') {
            try {
                req.body.chatIds = JSON.parse(req.body.chatIds);
            } catch {
                if (req.body.chatIds.includes(',')) {
                    req.body.chatIds = req.body.chatIds
                        .split(',')
                        .map(item => item.trim())
                        .filter(Boolean);
                } else if (req.body.chatIds.trim()) {
                    req.body.chatIds = [req.body.chatIds.trim()];
                }
            }
        }

        next();
    });
};

module.exports = broadcastUpload;

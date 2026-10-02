const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure destination directory exists
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const userId = req.user?.id || 'admin';
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `avatar-${userId}-${uniqueSuffix}${ext}`);
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
        fileSize: 5 * 1024 * 1024 // 5MB max
    }
});

// Wrapper middleware to support various field names ('avatar', 'avata', 'file', 'image')
const avatarUpload = (req, res, next) => {
    upload.any()(req, res, (err) => {
        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({
                    success: false,
                    message: 'File size too large. Maximum allowed size is 5MB.'
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message || 'File upload error.'
            });
        }

        // Check if a file was uploaded
        if (req.files && req.files.length > 0) {
            const matchedFile = req.files.find(f => ['avatar', 'avata', 'image', 'file'].includes(f.fieldname)) || req.files[0];
            req.file = matchedFile;
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No avatar image uploaded. Please upload a file with field name "avatar" or "avata".'
            });
        }

        next();
    });
};

module.exports = avatarUpload;

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Ensure destination directory exists
const uploadDir = path.join(__dirname, '../../uploads/avatars');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Use memory storage so we can process the image before saving
const storage = multer.memoryStorage();

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
    upload.any()(req, res, async (err) => {
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

        try {
            const userId = req.user?.id || 'admin';
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            
            // Convert to WEBP for better compression, unless it's an SVG
            let ext = '.webp';
            let filename = `avatar-${userId}-${uniqueSuffix}${ext}`;
            let filepath = path.join(uploadDir, filename);

            if (req.file.mimetype === 'image/svg+xml') {
                ext = '.svg';
                filename = `avatar-${userId}-${uniqueSuffix}${ext}`;
                filepath = path.join(uploadDir, filename);
                // For SVG, we just save the buffer directly without processing via sharp
                fs.writeFileSync(filepath, req.file.buffer);
            } else {
                // Compress and resize other images using Sharp
                await sharp(req.file.buffer)
                    .resize(400, 400, {
                        fit: sharp.fit.inside,
                        withoutEnlargement: true
                    })
                    .webp({ quality: 80 }) // 80% quality for optimal compression
                    .toFile(filepath);
            }

            // Update req.file properties so downstream controllers get the correct saved file info
            req.file.filename = filename;
            req.file.path = filepath;
            req.file.mimetype = req.file.mimetype === 'image/svg+xml' ? 'image/svg+xml' : 'image/webp';
            req.file.destination = uploadDir;
            
            next();
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: 'Error compressing image: ' + error.message
            });
        }
    });
};

module.exports = avatarUpload;

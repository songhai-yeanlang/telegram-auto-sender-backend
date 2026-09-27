require('dotenv').config();

module.exports = {
    port: process.env.PORT || 3000,
    db: {
        host: process.env.DB_HOST ,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        name: process.env.DB_NAME
    },
    jwtSecret: process.env.JWT_SECRET,
    mail: {
        user: (process.env.MAIL_USER || '').trim(),
        pass: (process.env.MAIL_PASS || '').trim().replace(/\s+/g, '')
    }
};
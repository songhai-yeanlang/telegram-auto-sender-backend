const nodemailer = require('nodemailer');
const env = require('../config/env.config');
const logger = require('./logger.util');

const transporter = nodemailer.createTransport({
    service: 'gmail', // Change if not using Gmail
    auth: {
        user: env.mail.user,
        pass: env.mail.pass
    }
});

const sendOtpEmail = async (to, otp) => {
    try {
        const mailOptions = {
            from: env.mail.user,
            to,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}\nThis OTP will expire in 10 minutes.\nIf you did not request this, please ignore this email.`
        };
        await transporter.sendMail(mailOptions);
        logger.info(`[Mail] OTP sent successfully to ${to}`);
    } catch (error) {
        logger.error(`[Mail] Failed to send OTP to ${to}: ${error.message}`);
        throw new Error('Failed to send email. Check your SMTP setup.');
    }
};

module.exports = { sendOtpEmail };

const nodemailer = require('nodemailer');
const env = require('../config/env.config');
const logger = require('./logger.util');

const transporter = nodemailer.createTransport({
    service: 'gmail',
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
            subject: 'Password Reset OTP Code',
            text: `Your OTP for password reset is: ${otp}\nThis code will expire in 15 minutes.\nIf you did not request this, please ignore this email.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                    <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                    <p style="color: #555; font-size: 15px;">Hello,</p>
                    <p style="color: #555; font-size: 15px;">You requested a password reset. Use the following OTP code to verify your request:</p>
                    <div style="background-color: #f4f6f8; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff;">${otp}</span>
                    </div>
                    <p style="color: #888; font-size: 13px; text-align: center;">This code will expire in 15 minutes.</p>
                    <p style="color: #888; font-size: 13px;">If you did not request a password reset, please ignore this email.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        logger.info(`[Mail] OTP sent successfully to ${to}`);
    } catch (error) {
        logger.error(`[Mail] Failed to send OTP to ${to}: ${error.message}`);
        throw new Error('Failed to send email. Check your SMTP configuration in .env.');
    }
};

module.exports = { sendOtpEmail };

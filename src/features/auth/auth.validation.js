const Joi = require('joi');

const loginSchema = Joi.object({
    username: Joi.string().max(50),
    email: Joi.string().email().max(100),
    identifier: Joi.string().max(100),
    password: Joi.string().required().messages({
        'string.empty': 'Password cannot be empty',
        'any.required': 'Password is required'
    })
}).or('username', 'email', 'identifier').messages({
    'object.missing': 'Please provide username or email'
});

const forgotPasswordSchema = Joi.object({
    email: Joi.string().email(),
    username: Joi.string()
}).or('email', 'username').messages({
    'object.missing': 'Please provide email or username'
});

const verifyOtpSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Valid email is required',
        'string.empty': 'Email cannot be empty',
        'any.required': 'Email is required'
    }),
    otp: Joi.string().length(6).required().messages({
        'string.length': 'OTP must be 6 digits',
        'string.empty': 'OTP cannot be empty',
        'any.required': 'OTP is required'
    })
});

const resetPasswordSchema = Joi.object({
    newPassword: Joi.string().min(6).required().messages({
        'string.min': 'New password must be at least 6 characters',
        'string.empty': 'New password cannot be empty',
        'any.required': 'New password is required'
    }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
        'any.only': 'Confirm password must match new password',
        'string.empty': 'Confirm password cannot be empty',
        'any.required': 'Confirm password is required'
    }),
    token: Joi.string().optional(),
    resetToken: Joi.string().optional()
});

const changePasswordSchema = Joi.object({
    oldPassword: Joi.string().required().messages({
        'string.empty': 'Old password cannot be empty',
        'any.required': 'Old password is required'
    }),
    newPassword: Joi.string().min(6).required().messages({
        'string.min': 'New password must be at least 6 characters',
        'string.empty': 'New password cannot be empty',
        'any.required': 'New password is required'
    })
});

module.exports = {
    loginSchema,
    forgotPasswordSchema,
    verifyOtpSchema,
    resetPasswordSchema,
    changePasswordSchema
};

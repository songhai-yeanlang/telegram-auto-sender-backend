const Joi = require('joi');

const createContactSchema = Joi.object({
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required().messages({
        'string.empty': 'Phone number is required',
        'string.pattern.base': 'Invalid phone number format (e.g., +855...)'
    })
});

module.exports = { createContactSchema };
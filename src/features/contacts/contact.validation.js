const Joi = require('joi');

const createContactSchema = Joi.object({
    chatId: Joi.string().required().messages({
        'string.empty': 'Chat ID cannot be empty',
        'any.required': 'Chat ID is required'
    }),
    name: Joi.string().allow(null, ''),
    username: Joi.string().allow(null, '')
});

const updateContactSchema = Joi.object({
    chatId: Joi.string().required().messages({
        'string.empty': 'Chat ID cannot be empty',
        'any.required': 'Chat ID is required'
    }),
    status: Joi.string().valid('pending', 'sent', 'failed').required().messages({
        'string.empty': 'Status cannot be empty',
        'any.required': 'Status is required',
        'any.only': 'Status must be pending, sent, or failed'
    })
});

module.exports = { createContactSchema, updateContactSchema };
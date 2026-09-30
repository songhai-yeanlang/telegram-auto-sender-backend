const Joi = require('joi');

const createContactSchema = Joi.object({
    chatId: Joi.string().required().messages({
        'string.empty': 'Chat ID cannot be empty',
        'any.required': 'Chat ID is required'
    }),
    name: Joi.string().allow(null, '').default('none')
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

const updateContactByIdSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'ID must be a number',
        'any.required': 'ID is required'
    }),
    chatId: Joi.string().messages({
        'string.empty': 'Chat ID cannot be empty'
    }),
    chat_id: Joi.string().messages({
        'string.empty': 'Chat ID cannot be empty'
    }),
    name: Joi.string().allow(null, ''),
    status: Joi.string().valid('pending', 'sent', 'failed').messages({
        'any.only': 'Status must be pending, sent, or failed'
    }),
    errorMessage: Joi.string().allow(null, ''),
    error_message: Joi.string().allow(null, '')
}).min(2).messages({
    'object.min': 'At least one field (chatId, name, status, errorMessage) must be provided to update'
});

const deleteContactSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        'number.base': 'ID must be a number',
        'any.required': 'ID is required'
    })
});

module.exports = { createContactSchema, updateContactSchema, updateContactByIdSchema, deleteContactSchema };
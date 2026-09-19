const Joi = require('joi');

const createContactSchema = Joi.object({
    chatId: Joi.string().required().messages({
        'string.empty': 'Chat ID មិនអាចទទេបានទេ',
        'any.required': 'ទាមទារ Chat ID'
    })
});

const updateContactSchema = Joi.object({
    chatId: Joi.string().required().messages({
        'string.empty': 'Chat ID មិនអាចទទេបានទេ',
        'any.required': 'ទាមទារ Chat ID'
    }),
    status: Joi.string().valid('pending', 'sent', 'failed').required().messages({
        'string.empty': 'Status មិនអាចទទេបានទេ',
        'any.required': 'ទាមទារ Status',
        'any.only': 'Status ត្រូវតែជា pending, sent, ឬ failed'
    })
});

module.exports = { createContactSchema, updateContactSchema };
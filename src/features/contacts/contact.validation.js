const Joi = require('joi');

const createContactSchema = Joi.object({
    chatId: Joi.string().required().messages({
        'string.empty': 'Chat ID មិនអាចទទេបានទេ',
        'any.required': 'ទាមទារ Chat ID'
    })
});

module.exports = { createContactSchema };
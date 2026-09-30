const Joi = require('joi');

const broadcastSchema = Joi.object({
    message: Joi.string().required().messages({
        'string.empty': 'Message cannot be empty',
        'any.required': 'Message is required'
    }),
    contactIds: Joi.array().items(Joi.number().integer().positive()).min(1).messages({
        'array.min': 'Please select at least one contact to send'
    }),
    chatIds: Joi.array().items(Joi.string()).min(1).messages({
        'array.min': 'Please select at least one contact to send'
    })
}).or('contactIds', 'chatIds').messages({
    'object.missing': 'Please provide selected contactIds or chatIds'
});

module.exports = { broadcastSchema };

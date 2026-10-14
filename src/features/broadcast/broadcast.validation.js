const Joi = require('joi');

const broadcastSchema = Joi.object({
    message: Joi.string().allow('', null).optional().messages({
        'string.base': 'Message must be a string'
    }),
    contactIds: Joi.array().items(Joi.number().integer().positive()).min(1).messages({
        'array.min': 'Please select at least one contact to send'
    }),
    chatIds: Joi.array().items(Joi.string()).min(1).messages({
        'array.min': 'Please select at least one contact to send'
    }),
    scheduledAt: Joi.date().iso().optional().messages({
        'date.format': 'scheduledAt must be a valid ISO date'
    })
}).or('contactIds', 'chatIds').messages({
    'object.missing': 'Please provide selected contactIds or chatIds'
});

const scheduleBroadcastSchema = Joi.object({
    message: Joi.string().allow('', null).optional().messages({
        'string.base': 'Message must be a string'
    }),
    contactIds: Joi.array().items(Joi.number().integer().positive()).min(1).messages({
        'array.min': 'Please select at least one contact to send'
    }),
    chatIds: Joi.array().items(Joi.string()).min(1).messages({
        'array.min': 'Please select at least one contact to send'
    }),
    scheduledAt: Joi.date().iso().required().messages({
        'any.required': 'Please provide a scheduled time (scheduledAt)',
        'date.format': 'scheduledAt must be a valid ISO date'
    })
}).or('contactIds', 'chatIds').messages({
    'object.missing': 'Please provide selected contactIds or chatIds'
});

module.exports = { broadcastSchema, scheduleBroadcastSchema };

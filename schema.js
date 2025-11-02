const Joi = require('joi');

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().min(0).required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        image: Joi.object({
            url: Joi.string().uri().required(),
            filename: Joi.string().allow('', null)
        }).required(),
    }).required(),
});
module.exports.listingSchema = listingSchema;
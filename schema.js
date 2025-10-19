const Joi = require("joi");

const listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.object({
            filename: Joi.string()
                        .allow("") //allow empty
                        .default("listingimage"),
            url: Joi.string()
                .allow("") // allow empty string
                .default("https://images.unsplash.com/photo-1758797849614-aea4f74fb056?q=80&w=685&auto=format&fit=crop")
        }).optional()
    }).required()
});

const reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});

module.exports = {listingSchema, reviewSchema};


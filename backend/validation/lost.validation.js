const Joi = require("joi");

const lostItemSchema = Joi.object({
    name: Joi.string().min(2).required(),
    category: Joi.string().required(),
    location: Joi.string().required(),
    date: Joi.string().required(),
    description: Joi.string().allow(""),
    status: Joi.string().valid("open", "claimed", "closed").default("open"),
    image: Joi.string().allow("")
});

module.exports = { lostItemSchema };

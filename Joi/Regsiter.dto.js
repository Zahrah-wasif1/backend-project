const Joi = require("joi");

const registerDTO = Joi.object({
    email: Joi.string().email().required(),
    password:Joi.string().min(6).max(100).required(),
    username:Joi.string().min(3).max(100).required(),
});
module.exports = { registerDTO };

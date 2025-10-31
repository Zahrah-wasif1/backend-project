const Joi = require("joi");

const registerDTO = Joi.object({
  fullName: Joi.string().min(3),
  email: Joi.string().email(),
  phoneNumber: Joi.string().min(10),
  address: Joi.string().min(5),
  idType: Joi.string().valid("CNIC", "Passport", "Driving License", "Other"),
  idNumber: Joi.string().min(5),
  //password: Joi.string().min(6).required(),
});
module.exports = { registerDTO };

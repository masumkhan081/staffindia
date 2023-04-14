const joi = require("joi");

const registerSchema = joi.object({
  name: joi.string().min(3).required().messages({ "string.min": "Too short" }),

  email: joi
    .string()
    .min(12)
    .email()
    .required()
    .messages({ "string.email": "not valid email" }),
  password: joi
    .string()
    .min(6)
    .required()
    .messages({ "string.min": "Password should be at least 6 chars" }),
  confirmpassword: joi
    .any()
    .equal(joi.ref("password"))
    .required()
    .messages({ "any.only": "Password does not match" }),
});

const loginSchema = joi.object({
  email: joi
    .string()
    .email()
    .required()
    .messages({ "string.email": "not valid email" }),
  password: joi.string().min(6).required(),
});

function do_check(obj, what) {
  let errors;
  if (what == "register") {
    errors = registerSchema.validate(obj);
  }
  if (what == "login") {
    errors = loginSchema.validate(obj);
  }
  return errors;
}

module.exports = {
  do_check,
  loginSchema,
  registerSchema,
};

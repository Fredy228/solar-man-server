const Joi = require('joi');

exports.sendEmailValidator = data =>
  Joi.object()
    .keys({
      name: Joi.string().min(2).max(20).required(),
      phone: Joi.string()
        .pattern(
          /^(\+38)?\s?(\(0\d{2}\)|0\d{2})[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/
        )
        .required(),
    })
    .options({ stripUnknown: true })
    .validate(data);

exports.userRegister = data =>
  Joi.object()
    .keys({
      name: Joi.string()
        .pattern(/^[a-zA-Z0-9_\-\.]{2,20}$/)
        .min(2)
        .max(20)
        .required(),
      role: Joi.string().valid('admin', 'moderator', 'user').default('user'),
      email: Joi.string().email().required(),
      password: Joi.string()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,30}$/)
        .required(),
    })
    .options({ stripUnknown: true })
    .validate(data);

exports.userUpdate = data =>
  Joi.object()
    .keys({
      name: Joi.string()
        .pattern(/^[a-zA-Z0-9_\-\.]{2,20}$/)
        .min(2)
        .max(20)
        .required(),
      email: Joi.string().email(),
    })
    .options({ stripUnknown: true })
    .validate(data);

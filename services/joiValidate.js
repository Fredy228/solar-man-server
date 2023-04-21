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
    .validate(data);

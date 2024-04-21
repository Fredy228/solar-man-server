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
      email: Joi.string().email(),
    })
    .options({ stripUnknown: true })
    .validate(data);

exports.QuizValidator = data =>
  Joi.object()
    .keys({
      name: Joi.string().min(2).max(20).required(),
      phone: Joi.string()
        .pattern(
          /^(\+38)?\s?(\(0\d{2}\)|0\d{2})[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/
        )
        .required(),
      // email: Joi.string().email(),
      forWhat: Joi.string()
        .valid(
          'Підприємство (офіс, ТРЦ, готель, ресторан)',
          'Власний будинок',
          'Заробіток на зеленому тарифі'
        )
        .required(),
      problem: Joi.string()
        .valid(
          'Повна незалежність від електромережі',
          'Компенсація частини споживання',
          'Резервне живлення',
          'Пасивний дохід'
        )
        .required(),
      power: Joi.string()
        .valid(
          'до 5 кВт',
          'до 10 кВт',
          'до 20 кВт',
          'до 30 кВт',
          'більше 30 кВт'
        )
        .required(),
      country: Joi.string()
        .valid('Одеса', 'Миколаїв', 'Область', 'Інше')
        .required(),
      whichCountry: Joi.string().min(0).max(40),
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
        .max(20),
      email: Joi.string().email(),
      role: Joi.string().valid('admin', 'moderator', 'user'),
      newPass: Joi.string().regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,30}$/
      ),
    })
    .options({ stripUnknown: true })
    .validate(data);

exports.createPost = data =>
  Joi.object()
    .keys({
      title: Joi.string().min(20).max(80).required(),
      year: Joi.string().max(4).required(),
      components: Joi.array().required(),
    })
    .validate(data);

exports.updatePost = data =>
  Joi.object()
    .keys({
      title: Joi.string().min(20).max(80),
      year: Joi.string().max(4),
      components: Joi.array(),
    })
    .options({ stripUnknown: true })
    .validate(data);

exports.CreateStoreSets = data =>
  Joi.object()
    .keys({
      title: Joi.string().min(2).max(80).required(),
      type: Joi.string()
        .valid(
          'Зелений тариф',
          'Автономні станції',
          'Резервне живлення',
          'Модульні безперебійні системи'
        )
        .required(),
      cost: Joi.number().min(0).required(),
      power: Joi.string().min(2).max(10).required(),
      descripMain: Joi.string().required(),
      descripCharacter: Joi.array().items(Joi.object()).required(),
      components: Joi.array().items(Joi.object()).required(),
    })
    .options({ stripUnknown: true })
    .validate(data);

exports.CreateStoreComponents = data =>
  Joi.object()
    .keys({
      title: Joi.string().min(2).max(80).required(),
      type: Joi.string()
        .valid(
          'Панелі',
          'Інвертори',
          'Акумулятори',
          'Кріплення',
          'Комлпектуючі',
          'Зарядні станції'
        )
        .required(),
      cost: Joi.number().min(0).required(),
      brand: Joi.string().min(2).max(20).default('unknown'),
      country: Joi.string().min(2).max(20).default('unknown'),
      descripMain: Joi.string().required(),
      descripCharacter: Joi.array().items(Joi.object()).required(),
      optionSort: Joi.object().required(),
    })
    .options({ stripUnknown: true })
    .validate(data);

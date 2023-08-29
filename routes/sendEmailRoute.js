const express = require('express');
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const TelegramBot = require('node-telegram-bot-api');
const validators = require('../services/joiValidate');
require('dotenv').config();

const router = express.Router();

router.post('/email', async (req, res) => {
  const { name, phone, email } = req.body;

  const { error, value } = validators.sendEmailValidator({
    name,
    phone,
    email,
  });
  if (error) {
    return res.status(400).json({ message: 'Invalidate number phone' });
  }

  const auth = {
    auth: {
      api_key: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
    },
  };

  const transporter = nodemailer.createTransport(mg(auth));

  const mailOptions = {
    from: 'smagrovich58@meta.ua',
    to: 'smagrovich58@gmail.com',
    subject: `Send number phone by ${value.name}`,
    text: `Ім'я: ${value.name}; \nНомер телефону: ${value.phone};`,
  };

  transporter.sendMail(mailOptions, function (error) {
    if (error) {
      console.log(error);
      return res.status(400).json({ message: error });
    } else {
      console.log('Email sent');
      return res.status(200).json({ message: 'Sent' });
    }
  });
});

const token =
  process.env.NODE_ENV === 'development'
    ? process.env.TELEGRAM_TOKEN_DEV
    : process.env.TELEGRAM_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const chatId =
  process.env.NODE_ENV === 'development'
    ? process.env.TELEGRAM_CHAT_ID_DEV
    : process.env.TELEGRAM_CHAT_ID;

router.post('/telegram', async (req, res) => {
  const { name, phone, email, currentGood } = req.body;

  const { error, value } = validators.sendEmailValidator({
    name,
    phone,
    email,
  });
  console.log(value);
  if (error) {
    console.log(error.message);
    if (error.message.includes('name'))
      return res
        .status(400)
        .json({ message: "Ваше ім'я повино будти від 2 до 20 символів" });
    if (error.message.includes('email'))
      return res.status(400).json({ message: 'Ваш email невірний' });
    if (error.message.includes('phone'))
      return res.status(400).json({ message: 'Ваш номер телефону невірний' });
  }

  let message = `Ім'я: ${value.name}; \nНомер телефону: ${value.phone}; \n`;

  if (email) message += `Email: ${email}; \n`;

  if (currentGood) message += `Заявка стосовно: ${currentGood}`;

  bot
    .sendMessage(chatId, message)
    .then(() => {
      return res.status(200).json({ message: 'Sent' });
    })
    .catch(error => {
      console.error('Ошибка:', error);
      return res.status(400).json({ message: error });
    });
});

router.post('/quiz', async (req, res) => {
  console.log(req.body);

  const { error, value } = validators.QuizValidator(req.body);
  if (error) {
    console.log(error.message);
    if (error.message.includes('name'))
      return res
        .status(400)
        .json({ message: "Ваше ім'я повино будти від 2 до 20 символів" });
    if (error.message.includes('phone'))
      return res.status(400).json({ message: 'Ваш номер телефону невірний' });
    if (error.message.includes('forWhat'))
      return res
        .status(400)
        .json({ message: 'Питання #1 - вказано некоректно' });
    if (error.message.includes('problem'))
      return res
        .status(400)
        .json({ message: 'Питання #2 - вказано некоректно' });
    if (error.message.includes('power'))
      return res
        .status(400)
        .json({ message: 'Питання #3 - вказано некоректно' });
    if (error.message.includes('country'))
      return res
        .status(400)
        .json({ message: 'Питання #4 - вказано некоректно' });
    if (error.message.includes('whichCountry'))
      return res
        .status(400)
        .json({ message: 'Питання #4 - максимальна кількість символів 40' });
  }

  let message = `Ім'я: ${value.name}; \nНомер телефону: ${value.phone}; \n`;

  message += `Quiz: \n 1)${value.forWhat} \n 2)${value.problem} \n 3)${value.power} \n 4)${value.country}`;

  if (value.whichCountry) message += `: ${value.whichCountry}`;

  bot
    .sendMessage(chatId, message)
    .then(() => {
      return res.status(200).json({ message: 'Sent' });
    })
    .catch(error => {
      console.error('Ошибка:', error);
      return res.status(400).json({ message: error });
    });
});

module.exports = router;

const express = require('express');
const nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const TelegramBot = require('node-telegram-bot-api');
const validators = require('../services/joiValidate');
require('dotenv').config();

const router = express.Router();

router.post('/email', async (req, res) => {
  const { name, phone } = req.body;

  const { error, value } = validators.sendEmailValidator({ name, phone });
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
  const { name, phone } = req.body;

  const { error, value } = validators.sendEmailValidator({ name, phone });
  console.log(value);
  if (error) {
    return res.status(400).json({ message: 'Invalidate number phone or name' });
  }

  bot
    .sendMessage(
      chatId,
      `Ім'я: ${value.name}; \nНомер телефону: ${value.phone};`
    )
    .then(() => {
      return res.status(200).json({ message: 'Sent' });
    })
    .catch(error => {
      console.error('Ошибка:', error);
      return res.status(400).json({ message: error });
    });
});

module.exports = router;

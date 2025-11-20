const express = require("express");
const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");
require("dotenv").config();

const validators = require("../services/joiValidate");
const TelegramSender = require("../services/telegram-sender");
const KeyCrm = require("../services/key-crm");

const router = express.Router();

router.post("/email", async (req, res) => {
  const { name, phone, email } = req.body;

  const { error, value } = validators.sendEmailValidator({
    name,
    phone,
    email,
  });
  if (error) {
    return res.status(400).json({ message: "Invalidate number phone" });
  }

  const auth = {
    auth: {
      api_key: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
    },
  };

  const transporter = nodemailer.createTransport(mg(auth));

  const mailOptions = {
    from: "smagrovich58@meta.ua",
    to: "smagrovich58@gmail.com",
    subject: `Send number phone by ${value.name}`,
    text: `Ім'я: ${value.name}; \nНомер телефону: ${value.phone};`,
  };

  transporter.sendMail(mailOptions, function (error) {
    if (error) {
      console.log(error);
      return res.status(400).json({ message: error });
    } else {
      console.log("Email sent");
      return res.status(200).json({ message: "Sent" });
    }
  });
});

router.post("/telegram", async (req, res) => {
  const { name, phone, email, currentGood } = req.body;
  const { utm_medium, utm_source, utm_campaign, utm_term, utm_content } =
    req.query;

  const { error, value } = validators.sendEmailValidator({
    name,
    phone,
    email,
  });
  console.log(value);
  if (error) {
    console.log(error.message);
    if (error.message.includes("name"))
      return res
        .status(400)
        .json({ message: "Ваше ім'я повино будти від 2 до 20 символів" });
    if (error.message.includes("email"))
      return res.status(400).json({ message: "Ваш email невірний" });
    if (error.message.includes("phone"))
      return res.status(400).json({ message: "Ваш номер телефону невірний" });
  }

  let message = `Ім'я: ${value.name}; \nНомер телефону: ${value.phone}; \n`;

  if (email) message += `Email: ${email}; \n`;

  if (currentGood) message += `Заявка стосовно: ${currentGood}`;

  if (process.env.NODE_ENV === "production")
    await KeyCrm.sendPipe(value, undefined, {
      utm_campaign,
      utm_medium,
      utm_content,
      utm_term,
      utm_source,
    });

  const isSendTelegram = await TelegramSender.sendMessage(message);
  if (!isSendTelegram)
    return res.status(400).json({ message: "Помилка відправки" });
  return res.status(200).json({ message: "Відправлено" });
});

router.post("/quiz", async (req, res) => {
  const { utm_medium, utm_source, utm_campaign, utm_term, utm_content } =
    req.query;

  const { error, value } = validators.QuizValidator(req.body);
  if (error) {
    console.log(error.message);
    if (error.message.includes("name"))
      return res
        .status(400)
        .json({ message: "Ваше ім'я повино будти від 2 до 20 символів" });
    if (error.message.includes("phone"))
      return res.status(400).json({ message: "Ваш номер телефону невірний" });
  }

  let message = `Ім'я: ${value.name}; \nНомер телефону: ${value.phone}; \n`;

  let comment = `Quiz: \n`;
  value.answers.map((answer, idx) => {
    comment += `${idx + 1})${answer} \n`;
  });

  message += comment;

  if (process.env.NODE_ENV === "production")
    await KeyCrm.sendPipe(value, comment, {
      utm_campaign,
      utm_medium,
      utm_content,
      utm_term,
      utm_source,
    });

  const isSendTelegram = await TelegramSender.sendMessage(message);
  if (!isSendTelegram)
    return res.status(400).json({ message: "Помилка відправки" });
  return res.status(200).json({ message: "Відправлено" });
});

module.exports = router;

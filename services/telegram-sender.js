const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();

const TOKEN_TELEGRAM =
  process.env.NODE_ENV === "development"
    ? process.env.TELEGRAM_TOKEN_DEV
    : process.env.TELEGRAM_TOKEN;
const CHAT_ID_TELEGRAM =
  process.env.NODE_ENV === "development"
    ? process.env.TELEGRAM_CHAT_ID_DEV
    : process.env.TELEGRAM_CHAT_ID;

class TelegramSender {
  constructor() {
    this.TOKEN_TELEGRAM = TOKEN_TELEGRAM || "";
    this.CHAT_ID_TELEGRAM = CHAT_ID_TELEGRAM || "";
    this.telegramBot = new TelegramBot(this.TOKEN_TELEGRAM, { polling: true });
  }

  async sendMessage(message) {
    try {
      await this.telegramBot.sendMessage(this.CHAT_ID_TELEGRAM, message);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
}

module.exports = new TelegramSender();

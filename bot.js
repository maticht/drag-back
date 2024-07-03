const TelegramBot = require('node-telegram-bot-api');

const token = '6895696224:AAFr_BxgvsWjv4ur_5_rgzv4P1vCrLnhQRQ';
//const token = '7040601221:AAGoLDdPDtWNFMi4CmQciAlWS3PNP9-KHOo'; //dev
const bot = new TelegramBot(token, { polling: true });

module.exports = bot;
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

// const token = '6895696224:AAFr_BxgvsWjv4ur_5_rgzv4P1vCrLnhQRQ';
// const PROD token = '6055564961:AAGKSunNGKMjfwto1es3pycH-IGzENTBt2w';
// const token = '7040601221:AAGoLDdPDtWNFMi4CmQciAlWS3PNP9-KHOo'; //dev
const token = process.env.BOT_TOKEN_DEV; //DEV
//const token = process.env.BOT_TOKEN; //PROD
const bot = new TelegramBot(token, { polling: true });

module.exports = bot;
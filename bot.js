const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
let token;

if(process.env.APP_MODE === "DEV" || process.env.APP_MODE === "TEST_PROD"){
    token = process.env.BOT_TOKEN_DEV;//DEV
}else if(process.env.APP_MODE === "PROD"){
    token = process.env.BOT_TOKEN; //PROD
}
const bot = new TelegramBot(token, { polling: true });


module.exports = bot;
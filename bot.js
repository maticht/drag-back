const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
let token;

if (process.env.APP_MODE === "DEV" || process.env.APP_MODE === "TEST_PROD") {
    if (process.env.NODE_ROLE === "MASTER") {
        console.log("Start MASTER")
        token = process.env.BOT_TOKEN_DEV;//DEV
    } else if (process.env.NODE_ROLE === "SLAVE_1") {
        console.log("Start eggo slave 1")
        token = "7297821794:AAF7WFb1hFfnvGOuEQy3vfpiVL0SUOFgJ1M"
    } else if (process.env.NODE_ROLE === "SLAVE_2") {
        console.log("Start eggo slave 2")
        token = "7224934123:AAHPmAuEoWSvwwUJ_b8NAdKZWxgg4meJu2s"
    } else if (process.env.NODE_ROLE === "SLAVE_3") {
        console.log("Start eggo slave 3")
        token = "7221268353:AAGXzvz9VfKtpMFlRaIIE7VcZQ-63eV_4HI"
    }
} else if (process.env.APP_MODE === "PROD") {
    if (process.env.NODE_ROLE === "MASTER") {
        console.log("Start MASTER")
        token = process.env.BOT_TOKEN; //PROD
    } else if (process.env.NODE_ROLE === "SLAVE_1") {
        console.log("Start eggo slave 1")
        token = "7297821794:AAF7WFb1hFfnvGOuEQy3vfpiVL0SUOFgJ1M"
    } else if (process.env.NODE_ROLE === "SLAVE_2") {
        console.log("Start eggo slave 2")
        token = "7224934123:AAHPmAuEoWSvwwUJ_b8NAdKZWxgg4meJu2s"
    } else if (process.env.NODE_ROLE === "SLAVE_3") {
        console.log("Start eggo slave 3")
        token = "7221268353:AAGXzvz9VfKtpMFlRaIIE7VcZQ-63eV_4HI"
    }
}
const bot = new TelegramBot(token, {polling: true});


module.exports = bot;
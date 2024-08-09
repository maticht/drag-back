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
    } else if (process.env.NODE_ROLE === "SLAVE_4") {
        console.log("Start eggo slave 4")
        token = "7305523083:AAFf4B8-e0fYzmix4k4R7eali0E3arZ3e64"
    } else if (process.env.NODE_ROLE === "SLAVE_5") {
        console.log("Start eggo slave 5")
        token = "7218765682:AAEQMFniAW6Dk0HsEUpxTPG_DcJ9lXw7OPk"
    } else if (process.env.NODE_ROLE === "SLAVE_6") {
        console.log("Start eggo slave 6")
        token = "6694898706:AAH-pnSrID5UcJWevcxH4oG6r5zof3sW_mk"
    } else if (process.env.NODE_ROLE === "SLAVE_7") {
        console.log("Start eggo slave 7")
        token = "7225460215:AAFoxWC2xwXzM0n8ARpeWv0bIAWSJWJzt0w"
    } else if (process.env.NODE_ROLE === "SLAVE_8") {
        console.log("Start eggo slave 8")
        token = "6884569027:AAGJKPMNid464n85YjFYxbwmYKPtTj5PNVI"
    } else if (process.env.NODE_ROLE === "SLAVE_9") {
        console.log("Start eggo slave 9")
        token = "7392892343:AAEA8NXAJCL8fhKzfj20CTr79LfqlJmls_M"
    } else if (process.env.NODE_ROLE === "SLAVE_10") {
        console.log("Start eggo slave 10")
        token = "7406157252:AAFjcGOUk9ghnEiaE27Nbc2H_UEgxv_4sww"
    }
}
const bot = new TelegramBot(token, {polling: true});


module.exports = bot;
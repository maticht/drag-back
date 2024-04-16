const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const getUserData = require("./bot/serverRequests/getUserData")
const cors = require('cors');
const {handleCallbacks} = require('./bot/callbacksHandlers');
const {User} = require("./models/user");
const token = '6895696224:AAFr_BxgvsWjv4ur_5_rgzv4P1vCrLnhQRQ';
const webAppUrl = 'https://drag-front.vercel.app/';
// 'https://drag-front.vercel.app/'
const bot = new TelegramBot(token, {polling: true});
const app = express();
const connection = require("./db");

connection();

app.use(express.json());
app.use(cors());
app.use("/getUserData", getUserData);

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    let user;
    if(text === '/start') {
        await bot.sendMessage(chatId, 'Выседи яйцо и получи дениги', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Играть', web_app: {url: `https://drag-front.vercel.app`}}]
                ]
            }
        })
        handleCallbacks(bot);
    }
});

app.post('/web-data', async (req, res) => {
    const {queryId, count} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Хорошая игра',
            input_message_content: {
                message_text: `Ваш счет ${count}`
            }
        })
        console.log("queryId:" + queryId);
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))
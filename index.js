const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const getUserData = require("./bot/serverRequests/user/getUserData");
const getAllUsers = require("./bot/serverRequests/user/getAllUsers");
const updateHummer = require("./bot/serverRequests/updateHummer");
const updateBarrel = require("./bot/serverRequests/barrel/updateBarrel");
const barrelExpectation = require("./bot/serverRequests/barrel/barrelExpectation");
const collectionBarrel = require("./bot/serverRequests/barrel/collectionBarrel");
const cors = require('cors');
const {handleCallbacks} = require('./bot/callbacksHandlers');
const {User} = require("./models/user");
const router = require('./bot/routes/index');
const token = '6895696224:AAFr_BxgvsWjv4ur_5_rgzv4P1vCrLnhQRQ';
const webAppUrl = 'https://drag-front.vercel.app/';
// http://tgbot.server195361.nazwa.pl/
// https://drag-front.vercel.app/
const bot = new TelegramBot(token, {polling: true});
const index = express();
const connection = require("./db");

connection();

index.use(express.json());
index.use(cors());
index.use('/api', router);
index.use("/getUserData", getUserData);
index.use("/updateHummer", updateHummer);
index.use("/updateBarrel", updateBarrel);
index.use("/barrelExpectation", barrelExpectation);
index.use("/collectionBarrel", collectionBarrel);
index.use("/getAllUsers", getAllUsers);

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    let user;
    if(text === '/start') {
        await bot.sendMessage(chatId, 'Выседи яйцо и получи дениги', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Играть', web_app: {url: `https://drag-front.vercel.app/`}}]
                ]
            }
        })
        handleCallbacks(bot);
    }
});

index.post('/web-data', async (req, res) => {
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

index.listen(PORT, () => console.log('server started on PORT ' + PORT))
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '6895696224:AAFr_BxgvsWjv4ur_5_rgzv4P1vCrLnhQRQ';
const webAppUrl = 'https://drag-front.vercel.app/';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if(text === '/start') {
        await bot.sendMessage(chatId, 'Выседи яйцо и получи дениги', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Играть', web_app: {url: webAppUrl}}]
                ]
            }
        })
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
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))
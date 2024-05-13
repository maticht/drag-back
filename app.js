const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const getUserData = require("./bot/serverRequests/user/getUserData");
const getAllUsers = require("./bot/serverRequests/user/getAllUsers");
const updateHummer = require("./bot/serverRequests/updateHummer");
const updateBarrel = require("./bot/serverRequests/barrel/updateBarrel");
const barrelExpectation = require("./bot/serverRequests/barrel/barrelExpectation");
const collectionBarrel = require("./bot/serverRequests/barrel/collectionBarrel");
const collectFromInvitees = require("./bot/serverRequests/user/collectFromInvitees");
const replenishmentFromInvitees = require("./bot/serverRequests/user/replenishmentFromInvitees");
const cors = require('cors');
const {handleCallbacks} = require('./bot/callbacksHandlers');
const {User} = require("./models/user");
const router = require('./bot/routes/index');
const token = '6895696224:AAFr_BxgvsWjv4ur_5_rgzv4P1vCrLnhQRQ';
//const token = '7040601221:AAGoLDdPDtWNFMi4CmQciAlWS3PNP9-KHOo'; //dev
const webAppUrl = 'https://dragoneggs.net.pl/';
// http://tgbot.server195361.nazwa.pl/
// https://drag-front.vercel.app/
const bot = new TelegramBot(token, {polling: true});
const app = express();
const connection = require("./db");

connection();

app.use(express.json());
app.use(cors());
app.use('/api', router);
app.use("/getUserData", getUserData);
app.use("/updateHummer", updateHummer);
app.use("/updateBarrel", updateBarrel);
app.use("/barrelExpectation", barrelExpectation);
app.use("/collectionBarrel", collectionBarrel);
app.use("/getAllUsers", getAllUsers);
app.use("/collectFromInvitees", collectFromInvitees);
app.use("/replenishmentFromInvitees", replenishmentFromInvitees);

async function startBot() {
    handleCallbacks(bot);
}

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

startBot().catch(e => {
    console.log(e.message);
});
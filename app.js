const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const getUserData = require("./bot/serverRequests/user/getUserData");
const getAllUsers = require("./bot/serverRequests/user/getAllUsers");
const alchemistUpgrade = require("./bot/serverRequests/user/alchemistUpgrade");
const updateHummer = require("./bot/serverRequests/updateHummer");
const updateAxe = require("./bot/serverRequests/updateAxe");
const updateBarrel = require("./bot/serverRequests/barrel/updateBarrel");
const barrelExpectation = require("./bot/serverRequests/barrel/barrelExpectation");
const collectionBarrel = require("./bot/serverRequests/barrel/collectionBarrel");
const collectFromInvitees = require("./bot/serverRequests/user/collectFromInvitees");
const replenishmentFromInvitees = require("./bot/serverRequests/user/replenishmentFromInvitees");
const collectDailyReward = require("./bot/serverRequests/user/collectDailyReward");
const checkDailyRewards = require("./bot/serverRequests/user/checkDailyRewards");
const faultAppearanceScene = require("./bot/serverRequests/user/faultAppearanceScene");
const cors = require('cors');
const {handleCallbacks} = require('./bot/callbacksHandlers');
const {User} = require("./models/user");
const router = require('./bot/routes/index');
const cron = require('node-cron');
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
app.use("/updateAxe", updateAxe);
app.use("/alchemistUpgrade", alchemistUpgrade)
app.use("/barrelExpectation", barrelExpectation);
app.use("/collectionBarrel", collectionBarrel);
app.use("/getAllUsers", getAllUsers);
app.use("/collectDailyReward", collectDailyReward);
app.use("/checkDailyRewards", checkDailyRewards);
app.use("/collectFromInvitees", collectFromInvitees);
app.use("/replenishmentFromInvitees", replenishmentFromInvitees);
app.use("/faultAppearanceScene", faultAppearanceScene)

async function startBot() {
    handleCallbacks(bot);
}

async function performWeeklyTask() {
    try {
        // Находим всех пользователей и сортируем по полю overallScore в порядке убывания
        const allUsers = await User.find().sort({ overallScore: -1 }).limit(100);

        // Определяем ранги и соответствующие награды
        const rewards = [
            { placeInTop: [1, 3], rewardValue: 20000, league: 'Diamond' },
            { placeInTop: [4, 10], rewardValue: 12000, league: 'Golden' },
            { placeInTop: [11, 20], rewardValue: 8000, league: 'Silver' },
            { placeInTop: [21, 50], rewardValue: 5000, league: 'Bronze' },
            { placeInTop: [51, 100], rewardValue: 3000, league: 'Stone' },
        ];

        const updatePromises = allUsers.map((user, index) => {
            const placeInTop = index + 1;
            const reward = rewards.find(r => placeInTop >= r.placeInTop[0] && placeInTop <= r.placeInTop[1]);

            if (reward) {
                user.weeklyRewards.push({
                    league: reward.league,
                    placeInTop: placeInTop,
                    rewardValue: reward.rewardValue,
                    rewardIssuedDate: new Date(),
                    rewardClaimedDate: 0,
                    isTaken: false,
                });
                return user.save();
            } else {
                return Promise.resolve();
            }
        });

        // Ждем, пока все обновления будут завершены
        await Promise.all(updatePromises);

        console.log('Weekly rewards updated for top 100 users');
    } catch (error) {
        console.error('Error performing weekly task:', error);
    }
}

// Планирование задачи на каждое воскресенье в 23:59:59
// cron.schedule('5 4 * * 0', performWeeklyTask, {
//     timezone: "Europe/Moscow" // Укажите нужный вам часовой пояс
// });

cron.schedule('0 */6 * * *', performWeeklyTask, {
    timezone: "Europe/Moscow" // Установите свой часовой пояс здесь
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

const PORT = 8002;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))

startBot().catch(e => {
    console.log(e.message);
});
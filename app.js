const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const faultAppearanceScene = require("./bot/serverRequests/user/faultAppearanceScene");

const cors = require('cors');
const {handleCallbacks} = require('./bot/callbacksHandlers');
const {User} = require("./models/user");
const router = require('./bot/routes/index');
const cron = require('node-cron');
//const token = '6895696224:AAFr_BxgvsWjv4ur_5_rgzv4P1vCrLnhQRQ';
const token = '7040601221:AAGoLDdPDtWNFMi4CmQciAlWS3PNP9-KHOo'; //dev
const webAppUrl = 'https://dragoneggs.net.pl/loadingScreen';
// http://tgbot.server195361.nazwa.pl/
// https://drag-front.vercel.app/
const bot = new TelegramBot(token, {polling: true});
const app = express();
const connection = require("./db");

connection();

app.use(express.json());
app.use(cors());
app.use('/api', router);
app.use("/faultAppearanceScene", faultAppearanceScene);


async function startBot() {
    handleCallbacks(bot);
}

async function performWeeklyTask() {

    try {
        // Находим всех пользователей и сортируем по полю overallScore в порядке убывания
        const allUsers = await User.find().sort({ overallScore: -1 }).limit(100);

        // Определяем ранги и соответствующие награды
        const scoreRewards = [
            { placeInTop: [1, 3], rewardValue: 20000, league: 'Diamond' },
            { placeInTop: [4, 10], rewardValue: 12000, league: 'Golden' },
            { placeInTop: [11, 20], rewardValue: 8000, league: 'Silver' },
            { placeInTop: [21, 50], rewardValue: 5000, league: 'Bronze' },
            { placeInTop: [51, 100], rewardValue: 3000, league: 'Stone' },
        ];

        const updatePromises = allUsers.map(async (user, index) => {
            const placeInTop = index + 1;
            const reward = scoreRewards.find(r => placeInTop >= r.placeInTop[0] && placeInTop <= r.placeInTop[1]);
            const newRewardsArray = [];

            if (reward) {

                // Обновляем старые незабранные награды, устанавливая isCanceled: true
                user.weeklyScoreRewards.forEach(reward => {
                    if (!reward.isTaken) {
                        reward.isCanceled = true;
                    }
                });

                newRewardsArray.push(user.weeklyScoreRewards[user.weeklyScoreRewards.length - 1]);

                newRewardsArray.push({
                    league: reward.league,
                    placeInTop: placeInTop,
                    rewardValue: reward.rewardValue,
                    rewardIssuedDate: new Date(),
                    rewardClaimedDate: 0,
                    isTaken: false,
                    isCanceled: false,
                });

                user.weeklyScoreRewards = newRewardsArray;
                return user.save();
            } else {
                return Promise.resolve();
            }
        });

        // Ждем, пока все обновления будут завершены
        await Promise.all(updatePromises);

        console.log('Weekly score rewards updated for top 100 users');
    } catch (error) {
        console.error('Error performing weekly task:', error);
    }

    try {
        // Находим всех пользователей и сортируем по количеству рефералов в порядке убывания
        const allUsers = await User.find()
            .sort({ 'referrals.referralUsers': -1 })
            .limit(100);

        // Определяем ранги и соответствующие награды
        const referralRewards = [
            { placeInTop: [1, 3], rewardValue: 30000, league: 'Diamond' },
            { placeInTop: [4, 10], rewardValue: 20000, league: 'Golden' },
            { placeInTop: [11, 20], rewardValue: 12000, league: 'Silver' },
            { placeInTop: [21, 50], rewardValue: 8000, league: 'Bronze' },
            { placeInTop: [51, 100], rewardValue: 5000, league: 'Stone' },
        ];

        const updatePromises = allUsers.map(async (user, index) => {
            const placeInTop = index + 1;
            const reward = referralRewards.find(r => placeInTop >= r.placeInTop[0] && placeInTop <= r.placeInTop[1]);
            const newRewardsArray = []
            if (reward) {
                // Обновляем старые незабранные награды, устанавливая isCanceled: true
                user.weeklyReferralRewards.forEach(reward => {
                    if (!reward.isTaken) {
                        reward.isCanceled = true;
                    }
                });
                newRewardsArray.push(user.weeklyReferralRewards[user.weeklyReferralRewards.length - 1])

                newRewardsArray.push({
                    league: reward.league,
                    placeInTop: placeInTop,
                    rewardValue: reward.rewardValue,
                    rewardIssuedDate: new Date(),
                    rewardClaimedDate: 0,
                    isTaken: false,
                    isCanceled: false,
                });

                user.weeklyReferralRewards = newRewardsArray;
                return user.save();
            } else {
                return Promise.resolve();
            }
        });

        // Ждем, пока все обновления будут завершены
        await Promise.all(updatePromises);

        console.log('Weekly referral rewards updated for top 100 users');
    } catch (error) {
        console.error("Error updating referral rewards:", error);
    }

}

// Планирование задачи на каждое воскресенье в 23:59:59
// cron.schedule('5 4 * * 0', performWeeklyTask, {
//     timezone: "Europe/Moscow" // Укажите нужный вам часовой пояс
// });

cron.schedule('0 */6 * * *', performWeeklyTask, {
    timezone: "Europe/Moscow" // Установите свой часовой пояс здесь
});


const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))

startBot().catch(e => {
    console.log(e.message);
});
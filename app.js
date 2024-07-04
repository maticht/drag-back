const express = require('express');
const bot = require('./bot');
const faultAppearanceScene = require("./bot/serverRequests/user/faultAppearanceScene");
const gettingEggScene = require("./bot/serverRequests/user/gettingEggScene");
const firstGoblinGameScene = require("./bot/serverRequests/user/firstGoblinGameScene");
const rewardsTemplateData = require("./eggsTemplateData/rewardsTemplateData.json");

const cors = require('cors');
const {handleCallbacks} = require('./bot/callbacksHandlers');
const {User} = require("./models/user");
const router = require('./bot/routes/index');
const cron = require('node-cron');
const app = express();
const connection = require("./db");

connection();

app.use(express.json());
app.use(cors());
app.use('/api', router);
app.use("/faultAppearanceScene", faultAppearanceScene);
app.use("/firstGoblinGameScene", firstGoblinGameScene);


async function startBot() {
    handleCallbacks(bot);
}

async function performWeeklyTask() {

    try {
        // Находим всех пользователей и сортируем по полю overallScore в порядке убывания
        const allUsers = await User.find().sort({ overallScore: -1 }).limit(1000);

        // Определяем ранги и соответствующие награды
        const scoreRewards = rewardsTemplateData.weeklyScoreRewards;

        const updatePromises = allUsers.map(async (user, index) => {
            const placeInTop = index + 1;
            const reward = scoreRewards.find(r => placeInTop >= r.placeInTop[0] && placeInTop <= r.placeInTop[1]);
            const newRewardsArray = [];

            if (reward) {

                user.weeklyScoreRewards.forEach(reward => {
                    if (!reward.isTaken) {
                        reward.isCanceled = true;
                    }
                });

                if(user.weeklyScoreRewards[user.weeklyScoreRewards.length - 1]){
                    newRewardsArray.push(user.weeklyScoreRewards[user.weeklyScoreRewards.length - 1]);
                }

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
            .limit(1000);

        // Определяем ранги и соответствующие награды
        const referralRewards = rewardsTemplateData.weeklyReferralRewards;

        const updatePromises = allUsers.map(async (user, index) => {
            const placeInTop = index + 1;
            const reward = referralRewards.find(r => placeInTop >= r.placeInTop[0] && placeInTop <= r.placeInTop[1]);
            const newRewardsArray = []
            if (reward) {

                user.weeklyReferralRewards.forEach(reward => {
                    if (!reward.isTaken) {
                        reward.isCanceled = true;
                    }
                });

                if(user.weeklyReferralRewards[user.weeklyReferralRewards.length - 1]) {
                    newRewardsArray.push(user.weeklyReferralRewards[user.weeklyReferralRewards.length - 1])
                }

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


async function userNotification() {
    const dateNow = new Date();

    const usersToUpdate = await User.find({
        $and: [
            { "energy.energyFullRecoveryDate": { $lte: dateNow } },
            { "barrel.collectionTime": { $lte: dateNow } },
            { isNotified: false }
        ]
    }, "chatId isNotified");

    if (usersToUpdate.length === 0) return;

    const chatIds = usersToUpdate.map(user => user.chatId);

    await Promise.all(chatIds.map(chatId =>
        bot.sendMessage(chatId, 'The barrel is full and the energy is restored, come back, hero', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'Play', web_app: { url: `https://dragoneggs.net.pl/loadingScreen` } }]
                ]
            }
        })
    ));

    await User.updateMany(
        { _id: { $in: usersToUpdate.map(user => user._id) } },
        { $set: { isNotified: true } }
    );
}
// Планирование задачи на каждое воскресенье в 23:59:59
// cron.schedule('5 4 * * 0', performWeeklyTask, {
//     timezone: "Europe/Moscow" // Укажите нужный вам часовой пояс
// });

cron.schedule('0 */6 * * *', performWeeklyTask, {
    timezone: "Europe/Moscow"
});

cron.schedule('0 */6 * * *', userNotification, {
    timezone: "Europe/Moscow"
});


const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))

startBot().catch(e => {
    console.log(e.message);
});
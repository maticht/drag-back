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
        const allUsers = await User.find()
            .sort({ overallScore: -1 })
            .limit(1000)
            .select('_id weeklyScoreRewards overallScore profileLevel');

        const scoreRewards = rewardsTemplateData.weeklyScoreRewards;
        const bestPlayersReward = rewardsTemplateData.bestPlayersReward;

        const bulkOperations = allUsers.map((user, index) => {
            const placeInTop = index + 1;
            const profileLevel = user.profileLevel;
            const reward = scoreRewards.find(r => placeInTop >= r.placeInTop[0] && placeInTop <= r.placeInTop[1]);
            const bestPlayerReward = bestPlayersReward.find(r => r.placeInTop === placeInTop);

            const newRewardsArray = [...user.weeklyScoreRewards];

            newRewardsArray.forEach(reward => {
                if (!reward.isTaken) {
                    reward.isCanceled = true;
                }
            });

            if (reward) {
                newRewardsArray.push({
                    league: reward.league,
                    placeInTop: placeInTop,
                    rewardValue: reward.rewardValue * rewardsTemplateData.RewardCoefficient[profileLevel],
                    specialRewardValue: bestPlayerReward ? bestPlayerReward.rewardValue * rewardsTemplateData.RewardCoefficient[profileLevel] : 0,
                    rewardIssuedDate: new Date(),
                    rewardClaimedDate: 0,
                    isTaken: false,
                    isCanceled: false,
                });
            }

            return {
                updateOne: {
                    filter: { _id: user._id },
                    update: {
                        $set: { weeklyScoreRewards: newRewardsArray.slice(-2) }
                    }
                }
            };
        });

        if (bulkOperations.length > 0) {
            await User.bulkWrite(bulkOperations);
        }

        console.log('Weekly score rewards updated for top 1000 users');
    } catch (error) {
        console.error('Error performing weekly task:', error);
    }

    try {
        const allUsers = await User.find()
            .sort({ 'referrals.referralUsers': -1 })
            .limit(1000)
            .select('_id weeklyReferralRewards referrals profileLevel');


        const referralRewards = rewardsTemplateData.weeklyReferralRewards;
        const bestPlayersReward = rewardsTemplateData.bestPlayersReward;

        const bulkOperations = allUsers.map((user, index) => {
            const placeInTop = index + 1;
            const profileLevel = user.profileLevel;
            const reward = referralRewards.find(r => placeInTop >= r.placeInTop[0] && placeInTop <= r.placeInTop[1]);
            const bestPlayerReward = bestPlayersReward.find(r => r.placeInTop === placeInTop);

            const newRewardsArray = [...user.weeklyReferralRewards];

            newRewardsArray.forEach(reward => {
                if (!reward.isTaken) {
                    reward.isCanceled = true;
                }
            });

            if (reward) {
                newRewardsArray.push({
                    league: reward.league,
                    placeInTop: placeInTop,
                    rewardValue: reward.rewardValue * rewardsTemplateData.RewardCoefficient[profileLevel],
                    specialRewardValue: bestPlayerReward ? bestPlayerReward.rewardValue * rewardsTemplateData.RewardCoefficient[profileLevel] : 0,
                    rewardIssuedDate: new Date(),
                    rewardClaimedDate: 0,
                    isTaken: false,
                    isCanceled: false,
                });
            }

            return {
                updateOne: {
                    filter: { _id: user._id },
                    update: {
                        $set: { weeklyReferralRewards: newRewardsArray.slice(-2) }
                    }
                }
            };
        });

        if (bulkOperations.length > 0) {
            await User.bulkWrite(bulkOperations);
        }

        console.log('Weekly referral rewards updated for top 1000 users');
    } catch (error) {
        console.error("Error updating referral rewards:", error);
    }

}

async function performDailyTask() {
    try {
        const allUsers = await User.find({ 'miniGame.dailyBestScore': { $ne: 0 } })
            .sort({ 'miniGame.dailyBestScore': -1 })
            .select('_id dailyMiniGameRewards miniGame profileLevel');


        const miniGameRewards = rewardsTemplateData.dailyGameRewards;
        const bestPlayersReward = rewardsTemplateData.bestPlayersReward;

        // const topUsers = allUsers.slice(0, 1000);

        const bulkOperations = allUsers.map((user, index) => {
            const placeInTop = index + 1;
            let update = {
                $set: { 'miniGame.dailyBestScore': 0 }
            };

            if (placeInTop <= 1000) {
                const reward = miniGameRewards.find(r => placeInTop >= r.placeInTop[0] && placeInTop <= r.placeInTop[1]);
                const bestPlayerReward = bestPlayersReward.find(r => r.placeInTop === placeInTop);
                const profileLevel = user.profileLevel;

                if (reward) {
                    const newRewardsArray = [...user.dailyMiniGameRewards];
                    newRewardsArray.push({
                        league: reward.league,
                        placeInTop: placeInTop,
                        rewardValue: reward.rewardValue * rewardsTemplateData.RewardCoefficient[profileLevel],
                        specialRewardValue: bestPlayerReward ? bestPlayerReward.rewardValue * rewardsTemplateData.RewardCoefficient[profileLevel] : 0,
                        rewardIssuedDate: new Date(),
                        rewardClaimedDate: 0,
                        isTaken: false,
                        isCanceled: false,
                    });

                    update = {
                        ...update,
                        $set: {
                            'miniGame.dailyBestScore': 0,
                            dailyMiniGameRewards: newRewardsArray.slice(-2)
                        }
                    };
                }
            }

            return {
                updateOne: {
                    filter: { _id: user._id },
                    update: update
                }
            };
        });

        if (bulkOperations.length > 0) {
            await User.bulkWrite(bulkOperations);
        }

        console.log('Daily mini game rewards updated for top 1000 users and dailyBestScore reset for all users');
    } catch (error) {
        console.error("Error updating mini game rewards:", error);
    }
}

async function userNotification() {
    const dateNow = new Date();

    const usersToUpdate = await User.find({
        $and: [
            {"energy.energyFullRecoveryDate": {$lte: dateNow}},
            {"barrel.collectionTime": {$lte: dateNow}},
            {isNotified: false}
        ]
    }, "chatId isNotified");

    if (usersToUpdate.length === 0) return;

    const chatIds = usersToUpdate.map(user => user.chatId);
    const photoUrl = 'https://res.cloudinary.com/dfl7i5tm2/image/upload/v1720269783/Rectangle_139_ygi2a6.png';
    const caption = 'The barrel is full and the energy is restored, come back';

    await Promise.all(chatIds.map(chatId => {

        bot.sendPhoto(chatId, photoUrl, {
            caption: caption,
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Play', web_app: {url: `https://dragoneggs.net.pl/loadingScreen`}}]
                ]
            }
        }).catch(error => {
            console.error('Error sending photo message:', error);
        });
    }));

    await User.updateMany(
        {_id: {$in: usersToUpdate.map(user => user._id)}},
        {$set: {isNotified: true}}
    );
}

// Планирование задачи на каждое воскресенье в 23:59:59
cron.schedule('5 4 * * 0', performWeeklyTask, {
    timezone: "Europe/Moscow" // Укажите нужный вам часовой пояс
});

// cron.schedule('0 */6 * * *', performWeeklyTask, {
//     timezone: "Europe/Moscow"
// });

//каждый день в 01:00
cron.schedule('0 1 * * *', performDailyTask, {
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
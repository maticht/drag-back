const express = require('express');
const bot = require('./bot');
const faultAppearanceScene = require("./bot/serverRequests/user/faultAppearanceScene");
const firstGoblinGameScene = require("./bot/serverRequests/user/firstGoblinGameScene");
const rewardsTemplateData = require("./eggsTemplateData/rewardsTemplateData.json");

const cors = require('cors');
const {handleCallbacks} = require('./bot/callbacksHandlers');
const {User} = require("./models/user");
const {Runes} = require("./models/runes");
const router = require('./bot/routes/index');
const cron = require('node-cron');
const app = express();
const connection = require("./db");
const {checkConnection} = require("./clickHouseClient");
const {insertDataToClickHouse} = require("./utils/clickHouse/insertData");
const {setUsersLanguages} = require("./utils/localization");
const locales = require("./eggsTemplateData/locales.json");
const rateLimit = require('express-rate-limit');
const mongoose = require("mongoose");
const {TournamentReward} = require("./models/tournamentReward");
const { withdraw } = require('./web3/withdraw');

require('dotenv').config();


async function initializeApp() {
    try {

        await connection();

        await checkConnection();

        app.set('trust proxy', true);

        const blockedIPs = new Map();

        const requestLimiter = rateLimit({
            windowMs: 3 * 60 * 1000,
            max: 260,
            handler: (req, res, next) => {
                const ip = req.ip;
                const blockDuration = 30 * 60 * 1000;
                blockedIPs.set(ip, Date.now() + blockDuration);
                console.log(`IP ${ip} is blocked for exceeding the request limit.`);
                res.status(429).json({ message: 'You are blocked due to suspicious activity.' });
            },
            keyGenerator: (req) => req.ip,
            skip: (req) => {
                const ip = req.ip;
                if (blockedIPs.has(ip)) {
                    const blockTime = blockedIPs.get(ip);
                    if (Date.now() < blockTime) {
                        return true;
                    } else {
                        blockedIPs.delete(ip);
                    }
                }
                return false;
            }
        });

        app.use((req, res, next) => {
            const ip = req.ip;
            if (blockedIPs.has(ip) && Date.now() < blockedIPs.get(ip)) {
                const blockEndTime = blockedIPs.get(ip);
                const remainingTime = blockEndTime - Date.now();

                const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
                const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

                console.log(`IP ${ip} is blocked for exceeding the request limit.`);
                console.log(`Remaining time: ${remainingMinutes} minutes and ${remainingSeconds} seconds`);

                return res.status(429).json({ message: 'You are blocked due to suspicious activity.' });
            }
            next();
        });

        app.use(requestLimiter);

        app.use(express.json());

        let domain;

        if(process.env.APP_MODE === "DEV"){
            domain = process.env.BASE_URL_DEV;//DEV
        }else if(process.env.APP_MODE === "PROD"){
            domain = process.env.BASE_URL_PROD; //PROD
        }else if(process.env.APP_MODE === "TEST_PROD"){
            domain = process.env.BASE_URL_TEST_PROD; //PROD
        }

        if(process.env.APP_MODE === "PROD"){
            const corsOptions = {
                origin: domain,
                optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
            };
            app.use(cors(corsOptions));
            app.use((req, res, next) => {
                const allowedDomain = domain;
                const origin = req.headers.origin;
                const referer = req.headers.referer;

                if (!origin || !referer || origin !== allowedDomain || !referer.startsWith(allowedDomain)) {
                    return res.status(403).json({ message: 'Access forbidden.' });
                }
                next();
            });
        }else{
            app.use(cors());
        }

        app.use((req, res, next) => {
            console.log('IP адрес клиента:', req.ip);
            next();
        });
        app.post('/withdraw', async (req, res) => {
            try {
                const hash = await withdraw(req.body)
                res.json({ hash })
            } catch (err) {
                res.status(500).json({ error: err.message })
            }
        })
        app.use('/api/encrypted/dmeay', router);
        app.use("/faultAppearanceScene", faultAppearanceScene);
        app.use("/firstGoblinGameScene", firstGoblinGameScene);

        const PORT = 8000;
        app.listen(PORT, () => console.log('Server started on PORT ' + PORT));

        await startBot();

        console.log("Initialization complete");
    } catch (error) {
        console.error("Error during initialization:", error);
    }
}

async function startBot() {
    await setUsersLanguages();
    handleCallbacks(bot);
}

initializeApp();

async function performWeeklyTask() {

    try {
        const allUsers = await User.find()
            .sort({ overallScore: -1 })
            .limit(1000)
            .select('_id weeklyScoreRewards overallScore profileLevel');

        const scoreRewards = rewardsTemplateData.weeklyScoreRewards;
        const bestPlayersReward = rewardsTemplateData.bestPlayersScoreReward;

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
                    rewardValue: reward.rewardValue[profileLevel - 1],// * rewardsTemplateData.RewardCoefficient[profileLevel],
                    specialRewardValue: bestPlayerReward ? bestPlayerReward.rewardValue[profileLevel - 1] : 0, // * rewardsTemplateData.RewardCoefficient[profileLevel] : 0,
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
        const allUsers = await User.aggregate([
            { $match: { 'referrals.referralUsers': { $ne: [] } } },
            { $addFields: { referralCount: { $size: '$referrals.referralUsers' } } },
            { $sort: { referralCount: -1 } },
            { $limit: 1000 },
            { $project: {
                    _id: 1,
                    weeklyReferralRewards: 1,
                    referrals: 1,
                    profileLevel: 1
                } }
        ]);


        const referralRewards = rewardsTemplateData.weeklyReferralRewards;
        const bestPlayersReward = rewardsTemplateData.bestPlayersRefReward;

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
                    rewardValue: reward.rewardValue[profileLevel - 1],// * rewardsTemplateData.RewardCoefficient[profileLevel],
                    specialRewardValue: bestPlayerReward ? bestPlayerReward.rewardValue[profileLevel - 1] : 0, // * rewardsTemplateData.RewardCoefficient[profileLevel] : 0,
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



async function setTournamentUsersRewards() {
    try {
        const topUsers = await User.find({
            'miniGame.dailyBestScore': { $ne: 0 },
            'profileLevel': { $gte: 3 },
            'miniGame.completedGamesNumber': { $gte: 10 },
            // 'walletConnected': true,
            $expr: {
                $gte: [{ $size: "$referrals.referralUsers" }, 3]
            }

        })
            .sort({ 'miniGame.dailyBestScore': -1 })
            .limit(10)
            .select('_id chatId miniGame');

        const tournamentRewards = rewardsTemplateData.tournamentRewards;

        const tournamentRewardPromises = topUsers.map(async (user, index) => {
            try {
                const tournamentPlaceInTop = index + 1;
                const reward = tournamentRewards.find(r => tournamentPlaceInTop >= r.tournamentPlaceInTop[0] && tournamentPlaceInTop <= r.tournamentPlaceInTop[1]);

                if (reward) {
                    const newTournamentReward = new TournamentReward({
                        chatId: user.chatId,
                        miniGameScore: user.miniGame.dailyBestScore,
                        tournamentPlaceInTop: tournamentPlaceInTop,
                        auroraTokens: reward.auroraTokens,
                        rewardIssuedDate: new Date(),
                        rewardClaimedDate: null,
                        isTaken: false,
                    });

                    return await newTournamentReward.save();
                }
            } catch (error) {
                console.error(`Error creating tournament reward for user ${user.chatId}:`, error);
            }
        });

        await Promise.all(tournamentRewardPromises);

        console.log('Tournament rewards created for top 10 users');
    } catch (error) {
        console.error("Error creating tournament rewards:", error);
    }
}


async function performDailyTask() {
    try {
        const allUsers = await User.find({ 'miniGame.dailyBestScore': { $ne: 0 } })
            .sort({ 'miniGame.dailyBestScore': -1 })
            .select('_id dailyMiniGameRewards miniGame profileLevel');


        const miniGameRewards = rewardsTemplateData.dailyGameRewards;
        const bestPlayersReward = rewardsTemplateData.bestPlayersGameReward;

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
                        rewardValue: reward.rewardValue[profileLevel - 1],// * rewardsTemplateData.RewardCoefficient[profileLevel],
                        specialRewardValue: bestPlayerReward ? bestPlayerReward.rewardValue[profileLevel - 1] : 0, // * rewardsTemplateData.RewardCoefficient[profileLevel] : 0,
                        keys: reward.keys,
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
            { "energy.energyFullRecoveryDate": { $lte: dateNow } },
            { "barrel.collectionTime": { $lte: dateNow } },
            { isNotified: false }
        ]
    }, "chatId isNotified language");

    
    if (usersToUpdate.length === 0) return;

    const photoUrl = 'https://eggoquest.fra1.cdn.digitaloceanspaces.com/Promo/Thetimehascomefornewexploits!.png';

    await Promise.all(usersToUpdate.map(user => {
        const userLanguage = user.language || 'en';
        const caption = locales[userLanguage].barrelEnergyNotification;
        const keyboard = locales[userLanguage].playInlineKeyboard;

        return bot.sendPhoto(user.chatId, photoUrl, {
            caption: caption,
            reply_markup: {
                inline_keyboard: keyboard
            }
        }).catch(error => {
            console.error(`Error sending photo message to user with chatId ${user.chatId}:`, error.message);
        });
    }));

    await User.updateMany(
        { _id: { $in: usersToUpdate.map(user => user._id) } },
        { $set: { isNotified: true } }
    );
}

async function updateRuneAvailability() {
    try {
        const runes = await Runes.find();

        const currentAvailableRuneIndex = runes.findIndex(rune => rune.isAvailable);

        // const nextRuneIndex = (currentAvailableRuneIndex + 1) % 4;
        const nextRuneIndex = Math.floor(Math.random() * runes.length);

        const bulkOperations = runes.map((rune, index) => {
            const isAvailable = index === nextRuneIndex;
            const expirationDate = isAvailable ? new Date(Date.now() + 24 * 60 * 60 * 1000) : rune.expirationDate;

            return {
                updateOne: {
                    filter: { _id: rune._id },
                    update: {
                        $set: {
                            isAvailable: isAvailable,
                            expirationDate: expirationDate
                        }
                    }
                }
            };
        });

        if (bulkOperations.length > 0) {
            await Runes.bulkWrite(bulkOperations);
        }

        console.log(`Rune availability updated. Next available rune: ${runes[nextRuneIndex].title}`);
    } catch (error) {
        console.error("Error updating rune availability:", error);
    }
}

// Планирование задачи на каждое воскресенье в 23:59:59
cron.schedule('59 59 23 * * 0', performWeeklyTask, {
    timezone: "Europe/Moscow"
});

//каждый день в 01:00
cron.schedule('0 1 * * *', performDailyTask, {
    timezone: "Europe/Moscow"
});

//каждый день в 00:00
cron.schedule('0 0 * * *', setTournamentUsersRewards, {
    timezone: "Europe/Moscow"
});

cron.schedule('0 */6 * * *', userNotification, {
    timezone: "Europe/Moscow"
});

//каждый день в 00:30
cron.schedule('30 0 * * *', updateRuneAvailability, {
    timezone: "Europe/Moscow"
});

if(process.env.APP_MODE === "PROD"){
    console.log("Click house timer begin")
    cron.schedule('*/10 * * * *', insertDataToClickHouse, {
        timezone: "Europe/Moscow"
    });
}


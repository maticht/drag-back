const {User} = require("../models/user");
const {getRandomEgg} = require("../utils/helpers");
const rewardTemplateData = require("../eggsTemplateData/rewardsTemplateData.json")
const {addToBuffer} = require("../utils/clickHouse/dataBuffer");
const {AlphaUser} = require("../models/alphaUsers");
const {AlphaUserReward} = require("../models/alphaUsersReward");
const {addToRefBuffer} = require("../utils/clickHouse/refDataBuffer");
const {languageMap} = require("../utils/localization");
const locales = require('../eggsTemplateData/locales.json');
require('dotenv').config();

const languageNames = {
    'en': 'English',
    'ru': 'Русский',
    'ua': 'Українська',
    'pt': 'Português',
    'es': 'Español'
};

const msgId = {};

function handleCallbacks(bot) {

    bot.onText(/\/start/, async (msg) => {
        try {

            const chatId = msg.chat.id;
            console.log(msg);
            let user = await User.findOne({chatId: chatId}); // юзер нажавший старт

            if (!user) {

                //--------------------------ALPHA-TESTERS-----------------------------------------------

                const alphaTester = await AlphaUser.findOne({chatId: chatId});
                let alphaTesterFlag = false;
                let scoreReward = 0;
                let referralReward = 0;
                let alphaEgg = null;

                if (alphaTester){

                    const allUsers = await AlphaUser.find({ 'overallScore': { $ne: 0 } })
                        .sort({ 'overallScore': -1 })
                        .select('_id overallScore chatId referrals eggs');

                    const alphaUser = allUsers.find(user => user.chatId === alphaTester.chatId);

                    if (alphaUser) {
                        alphaTesterFlag = true;
                        const placeInTop = allUsers.findIndex(user => user.chatId === alphaTester.chatId) + 1;
                        scoreReward = rewardTemplateData.alphaRewards.find(r => placeInTop >= r.placeInTop[0] && placeInTop <= r.placeInTop[1]).rewardValue;
                        referralReward = 10000 * alphaTester.referrals.referralUsers.length;

                        const alphaTesterReward = new AlphaUserReward({
                            chatId: alphaTester.chatId,
                            scoreReward,
                            referralReward
                        });

                        alphaEgg = [{
                                rarity: alphaTester.eggs[0].rarity,
                                name: alphaTester.eggs[0].name,
                                chance: alphaTester.eggs[0].chance,
                                score: 87,
                                stageScore: [8000, 29000, 185000, 704000, 2200000, 6550000, 18000000, 99999000000],
                                isOpen: false,
                                isDone: false,
                                isModalShown: false,
                        }]
                        await alphaTesterReward.save();
                    }
                    await AlphaUser.deleteOne({ _id: alphaTester._id });
                    addToBuffer(alphaTester.chatId, alphaTester.username, "registration alpha tester", alphaTester.score);
                }

                //--------------------------ALPHA-TESTERS-----------------------------------------------

                const egg = getRandomEgg();

                const childReferral = msg.text?.replace("/start ", ""); //айди родителя

                user = await new User({
                    firstName: msg.from?.first_name ? msg.from.first_name : "",
                    username: msg.from.username,
                    chatId: chatId,
                    alphaTester: alphaTesterFlag,
                    profileLevel: 1,
                    childReferral: childReferral,
                    language: "en",
                    referrals:{
                        referralStartTime: 0,
                        referralCollectionTime: 0,
                        referralUsers: [],
                    },
                    miniGameKeys: 0,
                    miniGame:  {
                        bestScore: 0,
                        completedGamesNumber: 0,
                        placeInTop: 0,
                        rewardValue: 0,
                        rewardIssuedDate: new Date(),
                        rewardClaimedDate: new Date(),
                        isTaken: false,
                        isCanceled: false,
                    },
                    auroraWalletHash: "",
                    firstEntry: false,
                    userTopPlace:0,
                    dailyReward: [
                        {
                            isRewardTaken: false,
                            dateOfAward: 0
                        },
                        {
                            isRewardTaken: false,
                            dateOfAward: 0
                        },
                        {
                            isRewardTaken: false,
                            dateOfAward: 0
                        },
                        {
                            isRewardTaken: false,
                            dateOfAward: 0
                        },
                        {
                            isRewardTaken: false,
                            dateOfAward: 0
                        },
                        {
                            isRewardTaken: false,
                            dateOfAward: 0
                        },
                        {
                            isRewardTaken: false,
                            dateOfAward: 0
                        },
                    ],
                    narrativeScenes:  {
                        faultAppearance: false,
                        gettingEgg: false,
                        dragonHatching: false,
                        firstGoblinGame: false,
                    },
                    axe: {
                        currentLevel: 1,
                    },
                    barrel: {
                        currentLevel: 1,
                        collectionTime: 0,
                        lastEntrance: 0,
                    },
                    hammer: {
                        currentLevel: 1,
                    },
                    energy: {
                        energyFullRecoveryDate: new Date(),
                        value:0,
                        lastEntrance: 0,
                        currentLevel: 1,
                    },
                    eggs: alphaTester ?
                        alphaEgg
                        :
                        [{
                        rarity: egg.rarity,
                        name: egg.name,
                        chance: egg.chance,
                        score: 0,
                        stageScore: [8000, 29000, 185000, 700000, 2200000, 6550000, 18000000, 99999000000],
                        isOpen: false,
                        isDone: false,
                        isModalShown: false,
                    }],
                    weeklyScoreRewards: [],
                    weeklyReferralRewards: [],
                }).save();

                languageMap.set(user.chatId.toString(), 'en');

                addToBuffer(user.chatId, user.username, "registration", null, user.score);

                if (childReferral) {

                    let maternalReferralUser = await User.findOne({chatId: childReferral}); // юзер родитель

                    if (maternalReferralUser) {
                        const pretendentIds = maternalReferralUser.referrals.referralUsers.map(user => user.chatId);

                        if (!pretendentIds.includes(chatId)) {

                            const newReferral = {
                                firstName: msg.from.first_name,
                                lastName: msg.from.last_name,
                                username: msg.from.username,
                                chatId: chatId,
                                score: 0,
                                lastRefScore:0,
                                miniGameKeys: 0,
                                collectionTime: new Date(Date.now() + 24 * 60 * 60 * 1000)
                            };
                            maternalReferralUser.referrals.referralUsers.push(newReferral);
                            const newReferralReward = {
                                referralName: msg.from.username ? msg.from.username : msg.from.first_name,
                                chatId: user.chatId,
                                rewardValue: rewardTemplateData.referralReward[maternalReferralUser.profileLevel - 1],
                                keys: 3,
                            }
                            maternalReferralUser.newReferralsRewards.push(newReferralReward)

                            await maternalReferralUser.save();

                            try {
                                const userLanguage = languageMap.get(maternalReferralUser.chatId.toString()) || 'en';
                                const text = locales[userLanguage].congratulationsMessage.replace('{username}', msg.from.username ? msg.from.username : msg.from.first_name);
                                const reward = rewardTemplateData.referralReward[maternalReferralUser.profileLevel - 1];
                                const message = text.replace('{reward}', reward);
                                const inlineKeyboard = locales[userLanguage].newReferralRewardInlineKeyboard;
                                await bot.sendMessage(maternalReferralUser.chatId, message, {
                                    parse_mode: 'HTML',
                                    reply_markup: {
                                        inline_keyboard: inlineKeyboard
                                    }
                                });
                            } catch (e) {
                                console.log(e.message);
                            }

                            addToRefBuffer(maternalReferralUser.chatId, user.chatId);
                            addToBuffer(maternalReferralUser.chatId, maternalReferralUser.username, "invite friend", null, maternalReferralUser.score);
                        }
                    }
                }

                const caption = locales[languageMap.get(chatId.toString())].startLanguageMessage;
                const keyboard = locales[languageMap.get(chatId.toString())].startMessageInlineKeyboardLanguages;

                const botMessage = await bot.sendMessage(chatId, caption, {
                    reply_markup: {
                        inline_keyboard: keyboard
                    }
                }).catch(error => {
                    console.error('Error sending photo message:', error);
                });

                msgId[chatId] = botMessage.message_id;

            }else{

                if(process.env.APP_MODE === "PROD"){
                    const photoUrl = "https://eggoquest.fra1.cdn.digitaloceanspaces.com/Promo/Whatisinside.png"
                    const caption = locales[languageMap.get(chatId.toString())].tryYourLuckMessage
                    const keyboard = locales[languageMap.get(chatId.toString())].eggPlayInlineKeyboard;

                    bot.sendPhoto(chatId, photoUrl, {
                        caption: caption,
                        reply_markup: {
                            inline_keyboard: keyboard
                        }
                    }).catch(error => {
                        console.error('Error sending photo message:', error);
                    });
                }else{
                    const photoUrl = "https://eggoquest.fra1.cdn.digitaloceanspaces.com/Promo/Whatisinside.png"
                    const caption = locales[languageMap.get(chatId.toString())].tryYourLuckMessage

                    bot.sendPhoto(chatId, photoUrl, {
                        caption: caption,
                        reply_markup: {
                            inline_keyboard: [
                                 [{ "text": "Play 👾", "web_app": { "url": "https://eggo-quest-test-nx3se.ondigitalocean.app/loadingScreen" } }],
                                 [{ "text": "Join Community 👥", "url": "https://t.me/eggoquest"}]
                            ],
                        }
                    }).catch(error => {
                        console.error('Error sending photo message:', error);
                    });
                }
            }

        } catch (e) {
            console.log(e.message);
        }
    });

    bot.onText(/\/info/, async (msg) => {
        try {
            const chatId = msg.chat.id;
            console.log(msg);

            const text = locales[languageMap.get(chatId.toString())].infoMessage;
            const keyboard = locales[languageMap.get(chatId.toString())].joinCommunityInlineKeyboard;
            await bot.sendMessage(chatId, text, {
                reply_markup: {
                    inline_keyboard: keyboard
                }
            });

        } catch (e) {
            console.log(e.message);
        }
    });

    bot.onText(/\/news/, async (msg) => {
        try {
            const chatId = msg.chat.id;
            console.log(msg);
            const photoUrl = "https://eggoquest.fra1.cdn.digitaloceanspaces.com/Promo/EggoQuesNews.png"
            const caption = locales[languageMap.get(chatId.toString())].newsMessage;
            const keyboard = locales[languageMap.get(chatId.toString())].joinCommunityInlineKeyboard;

            bot.sendPhoto(chatId, photoUrl, {
                caption: caption,
                reply_markup: {
                    inline_keyboard: keyboard
                }
            }).catch(error => {
                console.error('Error sending photo message:', error);
            });

        } catch (e) {
            console.log(e.message);
        }
    });

    bot.onText(/\/help/, async (msg) => {
        try {
            const chatId = msg.chat.id;
            console.log(msg);
            const photoUrl = "https://eggoquest.fra1.cdn.digitaloceanspaces.com/Promo/TECHNICAlsUPPORT.png"
            const caption = locales[languageMap.get(chatId.toString())].helpMessage;
            const keyboard = locales[languageMap.get(chatId.toString())].technicalSupportInlineKeyboard;

            bot.sendPhoto(chatId, photoUrl, {
                caption: caption,
                reply_markup: {
                    inline_keyboard: keyboard
                }
            }).catch(error => {
                console.error('Error sending photo message:', error);
            });

        } catch (e) {
            console.log(e.message);
        }
    });

    bot.onText(/\/settings/, async (msg) => {
        try {
            const chatId = msg.chat.id;
            const text = locales[languageMap.get(chatId.toString())].settingsMessage;
            const keyboard = locales[languageMap.get(chatId.toString())].settingsInlineKeyboard;
            const botMessage = await bot.sendMessage(chatId, text, {
                reply_markup: {
                    inline_keyboard: keyboard
                }
            }).catch(error => {
                console.error('Error sending photo message:', error);
            });

            try{
                setTimeout(()=>{
                    bot.deleteMessage(chatId, msg.message_id);
                }, 5000);
            }catch (e){
                console.log(e.message);
            }

            msgId[chatId] = botMessage.message_id;

        } catch (e) {
            console.log(e.message);
        }
    });

    bot.on('callback_query', async (callbackQuery) => {

        const message = callbackQuery.message;
        const chatId = message.chat.id;
        const data = callbackQuery.data;

        let languageCode;

        if(data.startsWith("start_language")){

            try {
                bot.deleteMessage(chatId, msgId[chatId]);
            }catch(e){
                console.log(e.message);
            }

            languageCode = data.split(":")[1];

            await User.findOneAndUpdate({ chatId }, { language: languageCode }, { new: true, upsert: true });
            languageMap.set(chatId.toString(), languageCode);

            const photoUrl = "https://eggoquest.fra1.cdn.digitaloceanspaces.com/Promo/Whatisinside.png"
            const caption = locales[languageCode].tryYourLuckMessage;
            const keyboard = locales[languageCode].eggPlayInlineKeyboard;

            bot.sendPhoto(chatId, photoUrl, {
                caption: caption,
                reply_markup: {
                    inline_keyboard: keyboard
                }
            }).catch(error => {
                console.error('Error sending photo message:', error);
            });
        }

        if(data.startsWith("language")){

            try {
                bot.deleteMessage(chatId, msgId[chatId]);
            }catch(e){
                console.log(e.message);
            }

            languageCode = data.split(":")[1];

            if (languageCode) {
                try {
                    await User.findOneAndUpdate({ chatId }, { language: languageCode }, { new: true, upsert: true });
                    languageMap.set(chatId.toString(), languageCode);

                    const languageName = languageNames[languageCode];
                    const text = locales[languageMap.get(chatId.toString())].languageSet;

                    const botMessage = await bot.sendMessage(chatId, `${text} ${languageName}.`
                    ).catch(error => {
                        console.error('Error sending language confirmation message:', error);
                    });

                    setTimeout(async () => {
                        try {
                            bot.deleteMessage(chatId, botMessage.message_id);
                        } catch (error) {
                            console.error('Error deleting message:', error);
                        }
                    }, 5000);

                } catch (error) {
                    console.error('Error updating user language:', error);
                    bot.sendMessage(chatId, 'There was an error updating your language. Please try again later.').catch(error => {
                        console.error('Error sending error message:', error);
                    });
                }
            }
        }

    });
}

module.exports = {handleCallbacks};
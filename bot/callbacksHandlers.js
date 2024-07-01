const {User} = require("../models/user");
const getRandomEgg = require("../utils/helpers");


function handleCallbacks(bot) {

    bot.onText(/\/start/, async (msg) => {
        try {
            const chatId = msg.chat.id;
            console.log(msg);
            let user = await User.findOne({chatId: chatId}); // юзер нажавший старт

            if (!user) {

                const egg = getRandomEgg();

                const childReferral = msg.text?.replace("/start ", ""); //айди родителя
                console.log("childReferral", childReferral)

                user = await new User({
                    firstName: msg.from?.first_name ? msg.from.first_name : "",
                    username: msg.from.username,
                    chatId: chatId,
                    profileLevel: 1,
                    childReferral: childReferral,
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
                    eggs: [{
                        rarity: egg.rarity,
                        name: egg.name,
                        chance: egg.chance,
                        score: 0,
                        stageScore: [180, 280, 380, 480, 580, 680, 780, 880],
                        isOpen: false,
                        isDone: false,
                        isModalShown: false,
                    }],
                    weeklyScoreRewards: [],
                    weeklyReferralRewards: [],
                }).save();

                if (childReferral) {

                    let maternalReferralUser = await User.findOne({chatId: childReferral}); // юзер родитель
                    // console.log("maternalReferralUser",maternalReferralUser.firstName, maternalReferralUser.chatId);

                    if (maternalReferralUser) {
                        const pretendentIds = maternalReferralUser.referrals.referralUsers.map(user => user.chatId);

                        if (!pretendentIds.includes(chatId)) {
                            const newReferral = {
                                firstName: msg.from.first_name,
                                lastName: msg.from.last_name,
                                username: msg.from.username,
                                chatId: chatId,
                                score: 250,
                                lastRefScore:0,
                                miniGameKeys: 10,
                                collectionTime: new Date(Date.now() + 24 * 60 * 1000)
                            };
                            maternalReferralUser.referrals.referralUsers.push(newReferral);
                            await maternalReferralUser.save();
                        }

                    }
                }
            }

            await bot.sendMessage(chatId, 'Try your luck, break the egg and see what happens next!', {
                reply_markup: {
                    inline_keyboard: [
                        [{text: 'Play', web_app: {url: `https://dragoneggs.net.pl/loadingScreen`}}]
                    ]
                }
            })

            console.log("user", user.firstName, user.chatId)


        } catch (e) {
            console.log(e.message);
        }

    });

    bot.onText(/\/info/, async (msg) => {
        try {
            const chatId = msg.chat.id;
            console.log(msg);
            await bot.sendMessage(chatId, 'Welcome to our exciting game where you can interact with a magical egg and gain money. Here’s what you can do:\n' +
                '\n' +
                '👆 Tap the Egg:\n' +
                '\n' +
                '- Tap on the egg to gain points.\n' +
                '- Each tap brings you closer to discovering what\'s inside!\n' +
                '\n' +
                '✨ Egg Rarity:\n' +
                '\n' +
                '- The egg has different rarity levels.\n' +
                '- Improve its rarity in the Alchemy Room to get better rewards.\n' +
                '\n' +
                '🔨 Hammer:\n' +
                '\n' +
                '- Upgrade your axe to increase the power of each tap.\n' +
                '- Boost your income with every upgrade.\n' +
                '\n' +
                '🪓 Axe:\n' +
                '\n' +
                '- Activate the axe by tapping the egg multiple times in a row.\n' +
                '- Your damage multiplies based on the level of your axe.\n' +
                '\n' +
                '⚡️ Energy Bottle:\n' +
                '\n' +
                '- Upgrading this bottle increases the energy available for tapping.\n' +
                '- It also speeds up energy recovery over time.\n' +
                '\n' +
                '💰 Barrel:\n' +
                '\n' +
                '- Collect income that accumulates over time.\n' +
                '- Gather your earnings at regular intervals.\n' +
                '\n' +
                '🏆 Leaderboards:\n' +
                '\n' +
                '- Compete with other players and climb the ranks.\n' +
                '- Higher ranks place you in better leagues with greater rewards.\n' +
                '\n' +
                '🎁 Daily Rewards:\n' +
                '\n' +
                'Receive daily rewards just for logging in.\n' +
                '\n' +
                '👥 Invite Friends:\n' +
                '\n' +
                '- Invite your friends to join the game and earn rewards for each new player.\n' +
                '- Get 8% of their daily income as a bonus!\n' +
                '\n' +
                'This is just the beginning! Many more exciting features are currently in development. Stay tuned for updates and new adventures!')
        } catch (e) {
            console.log(e.message);
        }

    });

}

module.exports = {handleCallbacks};
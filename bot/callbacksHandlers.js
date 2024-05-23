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
                    lastName: msg.from?.last_name ? msg.from.last_name : "",
                    username: msg.from.username,
                    childReferral: childReferral,
                    referralStartTime: 0,
                    referralCollectionTime: 0,
                    referralUsers: [],
                    chatId: chatId,
                    firstEntry: false,
                    lastRefScore: 0,
                    dailyReward: {
                        day1: {
                            isRewardTaken: false,
                            dateOfAward: 0
                        },
                        day2: {
                            isRewardTaken: false,
                            dateOfAward: 0
                        },
                        day3: {
                            isRewardTaken: false,
                            dateOfAward: 0
                        },
                        day4: {
                            isRewardTaken: false,
                            dateOfAward: 0
                        },
                        day5: {
                            isRewardTaken: false,
                            dateOfAward: 0
                        },
                        day6: {
                            isRewardTaken: false,
                            dateOfAward: 0
                        },
                        day7: {
                            isRewardTaken: false,
                            dateOfAward: 0
                        },
                    },
                    axe: {
                        name: 'Axe',
                        description: 'By clicking on the egg you charge the ax; after filling, you are given a chance to strike, the strength of which depends on your dexterity',
                        images: [
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714841284/axes/ax-1-lvl_pcdryy.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714841288/axes/ax-2-lvl_jzn5n5.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714841292/axes/ax-3-lvl_p0xrzv.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714841296/axes/ax-4-lvl_tiambt.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714841299/axes/ax-5-lvl_f9k7p4.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714841303/axes/ax-6-lvl_z4zikm.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714841308/axes/ax-7-lvl_i4hh7y.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714841311/axes/ax-8-lvl_pt9jgj.png",
                        ],
                        strength: [25, 50, 150, 200, 300, 400, 500, 666],
                        speed: [1, 2, 3, 4, 5, 6, 7, 8],
                        chance: [1, 2, 3, 4, 5, 6, 7, 8],
                        levels: [1, 2, 3, 4, 5, 6, 7, 8],
                        currentLevel: 1,
                        price: [10, 15, 22, 30, 40, 55, 70, 100],
                    },
                    barrel: {
                        name: 'Barrel',
                        description: 'The barrel passively accumulates gold every hour',
                        images: [
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714833796/barrels/barrel-1-lvl_s7clhh.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714833796/barrels/barrel-2-lvl_ilv4nm.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714833796/barrels/barrel-3-lvl_xj2ufk.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714833796/barrels/barrel-4-lvl_kvzjql.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714833796/barrels/barrel-5-lvl_kayitk.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714833796/barrels/barrel-6-lvl_z9mbwl.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714833797/barrels/barrel-7-lvl_lv4duq.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714833797/barrels/barrel-8-lvl_pplder.png",
                        ],
                        income: [250, 500, 1500, 2000, 3000, 4000, 5000, 6666],
                        levels: [1, 2, 3, 4, 5, 6, 7, 8],
                        currentLevel: 1,
                        waitingTime: [2, 4, 6, 8, 11, 14, 18, 24],
                        price: [10, 15, 22, 30, 40, 55, 70, 100],
                        lastEntrance: 0,
                        collectionTime: 0,
                    },
                    hammer: {
                        name: 'Hammer',
                        description: 'The ax is responsible for the strength and income from one blow to the egg',
                        images: [
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714839295/hummers/hummer-1-lvl_himidf.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714839296/hummers/hummer-2-lvl_lqpu85.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714839298/hummers/hummer-3-lvl_otnkt3.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714839299/hummers/hummer-4-lvl_ox9fn6.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714839301/hummers/hummer-5-lvl_hulvbx.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714839303/hummers/hummer-6-lvl_ntu8es.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714839304/hummers/hummer-7-lvl_ba4tkc.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714839306/hummers/hummer-8-lvl_wifwcu.png",
                        ],
                        strength: [1, 2, 3, 4, 5, 6, 7, 8],
                        income: [1, 2, 3, 4, 5, 6, 7, 8],
                        levels: [1, 2, 3, 4, 5, 6, 7, 8],
                        currentLevel: 1,
                        price: [10, 15, 22, 30, 40, 55, 70, 100],
                    },
                    energy: {
                        name: "Bottle",
                        description: "The energy bottle is responsible for the total amount and speed of energy recovery",
                        images: [
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1716397066/bottle-1-lvl_xe60ur.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1716397066/bottle-2-lvl_gh8qbm.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1716397066/bottle-3-lvl_dfnhgz.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1716397066/bottle-4-lvl_oynhnu.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1716397066/bottle-5-lvl_hun0ii.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1716397067/bottle-6-lvl_u9vun8.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1716397066/bottle-7-lvl_geyhit.png",
                            "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1716397067/bottle-8-lvl_f6uecl.png"
                        ],
                        value: 500,
                        energyFullRecoveryDate: new Date(),
                        energyCapacity: [500, 1000, 1500, 2000, 2500, 3000, 4000, 4500],
                        energyRecovery: [1, 2, 3, 4, 5, 6, 7, 8],
                        lastEntrance: 0,
                        levels: [1, 2, 3, 4, 5, 6, 7, 8],
                        currentLevel: 1,
                        price: [100, 150, 220, 300, 400, 550, 700, 1000]
                    },
                    eggs: [{
                        profit: 1,
                        assessedValue: 20,
                        rarity: egg.rarity,
                        model: "Dragon Egg",
                        name: egg.name,
                        images: {
                            model1: egg.images,
                            model2: [],
                            model3: [],
                            model4: [],
                            model5: [],
                            model6: [],
                            model7: [],
                            model8: [],
                        },
                        protection: 1,
                        chance: egg.chance,
                        price: 15,
                        purchaseStatus: true,
                        stage: 1,
                        score: 0,
                        stageScore: [180, 280, 380, 480, 580, 680, 780, 880],
                        isOpen: false,
                        isDone: false,
                    }],
                }).save();

                if (childReferral) {

                    let maternalReferralUser = await User.findOne({chatId: childReferral}); // юзер родитель
                    // console.log("maternalReferralUser",maternalReferralUser.firstName, maternalReferralUser.chatId);

                    if (maternalReferralUser) {
                        const pretendentIds = maternalReferralUser.referralUsers.map(user => user.chatId);

                        if (!pretendentIds.includes(chatId)) {
                            const newReferral = {
                                firstName: msg.from.first_name,
                                lastName: msg.from.last_name,
                                username: msg.from.username,
                                chatId: chatId,
                                score: 250,
                                collectionTime: new Date(Date.now() + 24 * 60 * 1000)
                            };
                            maternalReferralUser.referralUsers.push(newReferral);
                            await maternalReferralUser.save();
                        }

                    }
                }
            }

            await bot.sendMessage(chatId, 'Try your luck, break the egg and see what happens next!', {
                reply_markup: {
                    inline_keyboard: [
                        [{text: 'Play', web_app: {url: `https://dragoneggs.net.pl/`}}]
                    ]
                }
            })

            console.log("user", user.firstName, user.chatId)


        } catch (e) {
            console.log(e.message);
        }

    });

}

module.exports = {handleCallbacks};
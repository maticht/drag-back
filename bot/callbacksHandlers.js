const {User} = require("../models/user");



function handleCallbacks(bot) {

    bot.onText(/\/start/, async (msg) => {
        try {
            const chatId = msg.chat.id;

            let user = await User.findOne({chatId: chatId});

            if (!user) {
                user = await new User({
                    firstName: msg.from.first_name,
                    lastName: msg.from.last_name,
                    username: msg.from.username,
                    chatId: chatId,
                    firstEntry: false,
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
                        images: ['https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714135603/hammer_bkpls1.png'],
                        strength: [1, 2, 3, 4, 5, 6, 7, 8],
                        income: [1, 2, 3, 4, 5, 6, 7, 8],
                        levels: [1, 2, 3, 4, 5, 6, 7, 8],
                        currentLevel: 1,
                        price: [10, 15, 22, 30, 40, 55, 70, 100],
                    },
                    eggs:[{
                        profit: 1,
                        assessedValue: 20,
                        rarity: "Ordinary",
                        model: "Dragon Egg",
                        name: "Ordinary Egg",
                        images:  {
                                model1: [
                                    'https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714130717/dragonEggs/eggRarity1Stage1_et105p.png',
                                    'https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714130716/dragonEggs/eggRarity1Stage2_xgweun.png',
                                    'https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714130717/dragonEggs/eggRarity1Stage3_xh5vk0.png',
                                    'https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714130717/dragonEggs/eggRarity1Stage4_o9wczb.png',
                                    'https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714130718/dragonEggs/eggRarity1Stage5_tvfsqo.png',
                                    'https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714130717/dragonEggs/eggRarity1Stage6_tlpdhn.png',
                                    'https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714130717/dragonEggs/eggRarity1Stage7_xmqhnu.png',
                                    'https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714827758/eggRarity1Stage8_qugm9.png',
                                ],
                                model2: [], 
                                model3: [],
                                model4: [],
                                model5: [], 
                                model6: [], 
                                model7: [],
                                model8: [],
                        },
                        protection: 1,
                        chance: 10,
                        price: 15,
                        purchaseStatus: true,
                        stage: 1,
                        score: 0,
                        stageScore: [180, 280, 380, 480, 580, 680, 780, 880],
                        isOpen: false,
                        isDone: false,
                    }],
                }).save();
            }
            console.log(user)

        } catch (e) {
            console.log(e.message);
        }

    });

}

module.exports = {handleCallbacks};
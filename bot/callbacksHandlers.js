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
                    axe: {
                        name: 'Axe',
                        description: 'By clicking on the egg you charge the ax; after filling, you are given a chance to strike, the strength of which depends on your dexterity',
                        images: ['https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714135600/axe_hokdkt.png'],
                        strength: [25, 50, 150, 200, 300, 400, 500, 666],
                        speed: [1, 2, 3, 4, 5, 6, 7, 8],
                        chance: [1, 2, 3, 4, 5, 6, 7, 8],
                        levels: [1, 2, 3, 4, 5, 6, 7, 8],
                        currentLevel: 1,
                        price: [10000, 15000, 22000, 30000, 40000, 55000, 70000, 100000],
                    },
                    barrel: {
                        name: 'Barrel',
                        description: 'The barrel passively accumulates gold every hour',
                        images: ['https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714135601/barrel_vurzeq.png'],
                        income: [250, 500, 1500, 2000, 3000, 4000, 5000, 6666],
                        levels: [1, 2, 3, 4, 5, 6, 7, 8],
                        currentLevel: 1,
                        price: [10000, 15000, 22000, 30000, 40000, 55000, 70000, 100000],
                    },
                    hammer: {
                        name: 'Hammer',
                        description: 'The ax is responsible for the strength and income from one blow to the egg',
                        images: ['https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714135603/hammer_bkpls1.png'],
                        strength: [1, 2, 3, 4, 5, 6, 7, 8],
                        income: [1, 2, 3, 4, 5, 6, 7, 8],
                        levels: [1, 2, 3, 4, 5, 6, 7, 8],
                        currentLevel: 1,
                        price: [10000, 15000, 22000, 30000, 40000, 55000, 70000, 100000],
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
                                    'https://res.cloudinary.com/dfl7i5tm2/image/upload/v1714130717/dragonEggs/eggRarity1Stage8_eagaqj.png',
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
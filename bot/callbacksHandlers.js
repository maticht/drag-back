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
                    eggs:[{
                        profit: 1,
                        assessedValue: 20,
                        rarity: "Ordinary",
                        model: "Dragon Egg",
                        name: "Ordinary Egg",
                        images:  {type: 
                            {
                                model1: [{type: String, required: false}], 
                                model2: [{type: String, required: false}], 
                                model3: [{type: String, required: false}],
                                model4: [{type: String, required: false}],
                                model5: [{type: String, required: false}], 
                                model6: [{type: String, required: false}], 
                                model7: [{type: String, required: false}],
                                model8: [{type: String, required: false}],
                            }, required: false,},
                        protection: 1,
                        chance: 10,
                        price: 15,
                        purchaseStatus: {type: String, required: false},
                        stage: 1,
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
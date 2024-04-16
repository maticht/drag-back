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
                    chatId: chatId
                }).save();
            }
            console.log(user)

        } catch (e) {
            console.log(e.message);
        }

    });

}

module.exports = {handleCallbacks};
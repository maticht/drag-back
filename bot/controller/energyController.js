const {User} = require("../../models/user");
const storeData = require('../../eggsTemplateData/storeTemplateData.json');
const {addToBuffer} = require("../../utils/clickHouse/dataBuffer");
const bot = require("../../bot");
const {AlphaUser} = require("../../models/alphaUsers");
class EnergyController {

    async update(req, res, next){
        try {
            const { userId, energyRestoreTime, value } = req.body;

            const updatedUser = await User.findOneAndUpdate(
                { chatId: userId },
                { $set: { 'energy.energyFullRecoveryDate': energyRestoreTime, 'energy.value': value } },
                { new: true, projection: { _id: 0, energy: 1 } }
            );

            if (!updatedUser) {
                return res.status(404).send({ message: "User not found" });
            }

            const { energy } = updatedUser;
            return res.status(201).send({ message: "Дата восстановления энергии обновлена успешно", energy });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    };

    async updateBottle(req, res, next) {
        try {
            const user = await User.findOne({chatId: req.params.userId}, 'energy score username');
            if (!user) return res.status(400).send({message: "Invalid queryId"});

            const energy = user.energy;
            const storeEnergyData = storeData.energyBottle
            const currentLevel = energy.currentLevel;
            energy.lastEntrance = new Date();
            const price = storeEnergyData.price[currentLevel - 1];
            if (user.score < price) return res.status(400).send({message: "not enough money"});

            const fullEnergyTimeOld = new Date(energy.energyFullRecoveryDate);
            const now = new Date();
            const diffTime = now.getTime() - fullEnergyTimeOld.getTime();

            let energyValue;
            if (diffTime >= 0) {
                energyValue = storeEnergyData.energyCapacity[energy.currentLevel - 1];
            } else {
                const energyRestoredPerSecond = storeEnergyData.energyRecovery[energy.currentLevel - 1];
                const timeSinceLastUpdate = Math.abs(diffTime);
                const secondsSinceLastUpdate = Math.floor(timeSinceLastUpdate / 1000); // количество секунд с последнего обновления
                const energyNotRestored = secondsSinceLastUpdate * energyRestoredPerSecond; // всего восстановленной энергии
                energyValue = storeEnergyData.energyCapacity[energy.currentLevel - 1] - energyNotRestored;
            }
            energy.value = energyValue;

            if (currentLevel < 8) {
                user.score -= price;
                energy.currentLevel++;
            } else {
                return res.status(400).send({message: "Maximum level reached"});
            }

            const timeToRestoreEnergy = 1000; // восстановления энергии в сек
            const energyToRestore = storeEnergyData.energyCapacity[energy.currentLevel - 1] - energy.value; // сколько не хватает энергии
            const energyRestoredPerSecond = storeEnergyData.energyRecovery[energy.currentLevel - 1];
            const totalTimeToRestore = timeToRestoreEnergy * (energyToRestore / energyRestoredPerSecond)//делим на уровень восстановления энергии;

            const currentTime = new Date();

            const energyRestoreTime = new Date(currentTime.getTime() + totalTimeToRestore);

            energy.energyFullRecoveryDate = energyRestoreTime;

            user.energy = energy;

            await user.save();

            const userAgentString = req.headers['user-agent'];
            addToBuffer(req.params.userId, user.username,`energy upgrade ${energy.currentLevel}`, userAgentString, user.score);

            return res.json({energy: user.energy, score: user.score})
        } catch (error) {
            console.log(error);
            res.status(500).send({message: "Внутренняя ошибка сервера"});
        }
    }

    async addPole(req, res, next) {
        try {
            // const allUsers = await AlphaUser.find({}, 'chatId username firstName'); // Получаем всех пользователей и их chatId
            //
            // const photoUrl = "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1720666106/Group_899_df6gl9.png";
            // const caption = "Hello Eggo Quest Adventurers!\n" +
            //     "\n" +
            //     "To show our appreciation, we have a special reward waiting for you. To claim your reward, join our new bot by clicking the link below and await more prizes for alpha testers. Not only will you receive your reward, but you will also keep the style and rarity of your egg. Your feedback was invaluable, and we can't wait to continue this journey with you.\n" +
            //     "\n" +
            //     "Thank you for your support and happy questing!";
            //
            // let count = 0;
            //
            // function delay(ms) {
            //     count +=1 ;
            //     return new Promise(resolve => setTimeout(resolve, ms));
            // }
            //
            // for (const user of allUsers) {
            //     const chatId = user.chatId;
            //
            //     try {
            //         await bot.sendPhoto(chatId, photoUrl, {
            //             caption: caption,
            //             reply_markup: {
            //                 inline_keyboard: [
            //                     [{ text: 'Go to Eggo Quest bot!', url: 'https://t.me/eggo_quest_bot' }]
            //                 ]
            //             }
            //         });
            //
            //         console.log(`Message sent to user with chatId ${chatId} and username ${user.username ? user.username: user.firstName}`);
            //     } catch (error) {
            //         console.log(`Error sending photo message to user with chatId ${chatId} and username ${user.username ? user.username: user.firstName}: `, error.message);
            //     }
            //
            //     await delay(1000);
            // }
            //
            // return res.json({ message: 'Energy field added to users' });

            //
            // const allUsers = await User.find();
            //
            // const photoUrl = "https://res.cloudinary.com/dfl7i5tm2/image/upload/v1720666106/Group_899_df6gl9.png"
            // const caption = "Hello Eggo Quest Adventurers!\n" +
            //     "\n" +
            //     "To show our appreciation, we have a special reward waiting for you. To claim your reward, please join our new bot by clicking the link below. Not only will you receive your reward, but you will also keep the style and rarity of your egg. Your feedback was invaluable, and we can't wait to continue this journey with you.\n" +
            //     "\n" +
            //     "Thank you for your support and happy questing!"
            //
            // bot.sendPhoto("409840876", photoUrl, {
            //     caption: caption,
            //     reply_markup: {
            //         inline_keyboard: [
            //             [{ text: 'Go to Eggo Quest bot!', url: 'https://t.me/eggo_quest_bot' }]
            //         ]
            //     }
            // }).catch(error => {
            //     console.error('Error sending photo message:', error);
            // });
            //
            // return res.json({ message: 'Energy field added to users'});
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    }
}


module.exports = new EnergyController()
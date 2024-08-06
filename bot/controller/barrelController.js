const {User} = require("../../models/user");
const storeData = require('../../eggsTemplateData/storeTemplateData.json')
const {addToBuffer} = require("../../utils/clickHouse/dataBuffer");

class BarrelController {

    async upgrade(req, res){
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'barrel score username');
            if (!user) return res.status(400).send({ message: "Invalid queryId" });

            const barrel = user.barrel;
            const storeBarrelData = storeData.barrel
            const currentLevel = barrel.currentLevel;

            const price = storeBarrelData.price[currentLevel - 1];
            console.log(price);

            if (user.score < price) return res.status(400).send({ message: "not enough money" });

            const nextLevel = currentLevel + 1;

            if (nextLevel > 8) return res.status(400).send({ message: "Maximum level reached" });

            // Текущее время
            const now = new Date();

            // Вычислить оставшееся время до сбора в миллисекундах
            const remainingTimeMs = Math.max(0, barrel.collectionTime - now);
            console.log("remainingTimeMs ", remainingTimeMs)
            // Вычислить новое время ожидания для следующего уровня (если доступен)

            // Получить время ожидания для текущего уровня и следующего уровня в миллисекундах
            const currentWaitingTimeMs = storeBarrelData.waitingTime[currentLevel - 1] * 60 * 60 * 1000;
            const nextWaitingTimeMs = storeBarrelData.waitingTime[currentLevel] * 60 * 60 * 1000;

            // Рассчитать проработанное время на текущем уровне
            const workedTimeMs = currentWaitingTimeMs - remainingTimeMs;

            // Новое время сбора - новое время ожидания минус проработанное время
            const newCollectionTimeMs = nextWaitingTimeMs - workedTimeMs;
            console.log("newCollectionTimeMs ", newCollectionTimeMs)
            const newCollectionTime = new Date(now.getTime() + newCollectionTimeMs);
            console.log("newCollectionTime ", newCollectionTime)

            barrel.collectionTime = newCollectionTime;


            user.score -= price;
            barrel.currentLevel++;

            await user.save();

            const userAgentString = req.headers['user-agent'];
            addToBuffer(req.params.userId, user.username, `barrel upgrade ${barrel.currentLevel}`, userAgentString, user.score);

            return res.json({barrel, score: user.score})
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }

    async collect(req, res){
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'barrel score overallScore isNotified eggs username');
            if (!user) return res.status(400).send({ message: "Invalid queryId" });

            const barrel = user.barrel;
            const storeBarrelData = storeData.barrel

            const currentLevel = barrel.currentLevel;
            const waitingTime = storeBarrelData.waitingTime[currentLevel - 1];

            if(new Date() < barrel.collectionTime){
                return res.status(400).send({ message: "Collection unavailable" });
            }

            barrel.lastEntrance = new Date();

            const collectionTime = new Date();
            collectionTime.setTime(collectionTime.getTime() + waitingTime * 60 * 60 * 1000);

            barrel.collectionTime = collectionTime;
            barrel.workTime += storeBarrelData.waitingTime[currentLevel - 1]
            user.score += storeBarrelData.income[currentLevel - 1];
            user.overallScore += storeBarrelData.income[currentLevel - 1];
            user.isNotified = false;
            if (user.eggs.length > 0) {
                user.eggs[0].score += Math.round(storeBarrelData.income[currentLevel - 1] * 0.5);
            }
            await user.save();

            const userAgentString = req.headers['user-agent'];
            addToBuffer(req.params.userId, user.username, `collect barrel`, userAgentString, user.score);

            return res.json({workTime: barrel.workTime, lastEntrance: barrel.lastEntrance, collectionTime, score: user.score, overallScore: user.overallScore, eggScore: user.eggs[0].score, success:true})
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }

    async expectation(req, res){
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'barrel');
            if (!user) return res.status(400).send({ message: "Invalid queryId" });

            const barrel = user.barrel;
            const storeBarrelData = storeData.barrel
            const currentLevel = barrel.currentLevel;
            const waitingTime = storeBarrelData.waitingTime[currentLevel - 1];

            barrel.lastEntrance = new Date();
            const collectionTime = new Date();
            collectionTime.setTime(collectionTime.getTime() + waitingTime * 60 * 60 * 1000);
            barrel.collectionTime = collectionTime;

            await user.save();
            return res.json({lastEntrance: barrel.lastEntrance, collectionTime: barrel.collectionTime})
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }

}

module.exports = new BarrelController();
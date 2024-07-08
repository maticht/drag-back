const {User} = require("../../models/user");
const storeData = require('../../eggsTemplateData/storeTemplateData.json')
const {addToBuffer} = require("../../utils/clickHouse/dataBuffer");

class BarrelController {

    async upgrade(req, res){
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'barrel score');
            if (!user) return res.status(400).send({ message: "Invalid queryId" });

            const barrel = user.barrel;
            const storeBarrelData = storeData.barrel
            const currentLevel = barrel.currentLevel;


            const waitingTime = storeBarrelData.waitingTime[currentLevel];
            barrel.lastEntrance = new Date();

            const collectionTime = new Date();
            collectionTime.setTime(collectionTime.getTime() + waitingTime * 60 * 60 * 1000);
            barrel.collectionTime = collectionTime;

            const price = storeBarrelData.price[currentLevel - 1];

            if (user.score < price) return res.status(400).send({ message: "not enough money" });

            if (currentLevel < 8) {
                barrel.currentLevel++;
                user.score -= price;
            } else {
                return res.status(400).send({ message: "Maximum level reached" });
            }

            await user.save();

            const userAgentString = req.headers['user-agent'];
            addToBuffer(req.params.userId, `barrel upgrade ${barrel.currentLevel}`, userAgentString, null);

            return res.json({barrel, score: user.score})
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }

    async collect(req, res){
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'barrel score overallScore isNotified eggs');
            if (!user) return res.status(400).send({ message: "Invalid queryId" });

            const barrel = user.barrel;
            const storeBarrelData = storeData.barrel

            const currentLevel = barrel.currentLevel;
            const waitingTime = storeBarrelData.waitingTime[currentLevel - 1];

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
            addToBuffer(req.params.userId, `collect barrel`, userAgentString, null);

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
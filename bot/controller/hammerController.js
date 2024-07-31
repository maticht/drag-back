const {User} = require("../../models/user");
const storeData = require('../../eggsTemplateData/storeTemplateData.json');
const {addToBuffer} = require("../../utils/clickHouse/dataBuffer");

class HammerController {

    async upgrade(req, res){
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'hammer score username');
            if (!user) return res.status(400).send({ message: "Invalid queryId" });

            const hammer = user.hammer;
            const storeHammerData = storeData.hammer
            const currentLevel = hammer.currentLevel;
            const price = storeHammerData.price[currentLevel - 1];
            if (user.score < price) return res.status(400).send({ message: "not enough money" });
            if (currentLevel < 8) {
                user.score -= price;
                hammer.currentLevel++;
            } else {
                return res.status(400).send({ message: "Maximum level reached" });
            }
            await user.save();

            const userAgentString = req.headers['user-agent'];
            addToBuffer(req.params.userId, user.username, `hammer upgrade ${hammer.currentLevel}`, userAgentString, user.score);

            return res.json({hammer: user.hammer, score: user.score});
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }

}

module.exports = new HammerController();
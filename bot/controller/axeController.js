const {User} = require("../../models/user");
const storeData = require('../../eggsTemplateData/storeTemplateData.json')
const {addToBuffer} = require("../../utils/clickHouse/dataBuffer");

class AxeController {
    async upgrade(req, res) {
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'axe score username');

            if (!user) {
                return res.status(400).send({ message: "Invalid queryId" });
            }

            const { axe, score } = user;
            const { currentLevel } = axe;
            const storeAxeData = storeData.axe;

            if (currentLevel >= 8) {
                return res.status(400).send({ message: "Maximum level reached" });
            }

            const price = storeAxeData.price[currentLevel - 1];

            if (user.score < price) {
                return res.status(400).send({ message: "Not enough money" });
            }

            // axe.currentLevel++;
            // user.score -= price;
            if (currentLevel < 8) {
                user.score -= price;
                axe.currentLevel++;
            }

            await user.save();

            const userAgentString = req.headers['user-agent'];
            addToBuffer(req.params.userId, user.username, `axe upgrade ${axe.currentLevel}`, userAgentString, user.score);

            return res.json({ axe, score: user.score });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: "Internal Server Error" });
        }
    }
}

module.exports = new AxeController();
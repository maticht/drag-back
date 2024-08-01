const { User } = require("../../models/user");
const { Runes } = require("../../models/runes");
const runesTemplateData = require('../../eggsTemplateData/runesTemplateData.json');
const { addToBuffer } = require("../../utils/clickHouse/dataBuffer");
const { decryptData } = require("../../utils/helpers");

class RunesController {
    async getUserRunes(req, res) {
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'runes').populate('runes');
            if (!user) return res.status(400).send({ message: "Invalid queryId" });

            return res.json({ runes: user.runes });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Internal server error" });
        }
    }

    async createRune(req, res) {
        try {
            const { title, codeName, isAvailable, expirationDate } = req.body;
            const rune = new Runes({ title, codeName, isAvailable, expirationDate });
            await rune.save();
            return res.json({ message: `Rune "${rune.title}" created successfully` });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Internal server error" });
        }
    }

    async getAvailableRune(req, res) {
        try {
            const currentDate = new Date();
            const availableRune = await Runes.findOne({ isAvailable: true, expirationDate: { $gt: currentDate } });
            if (!availableRune) {
                return res.status(200).send({ message: "No available rune found", success:false });
            }
            return res.json({ rune: availableRune, success: true });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Internal server error", success:false });
        }
    }

    async buyRune(req, res) {
        try {
            const { userId } = req.params;
            const { bodyValue } = req.body;
            console.log('Body Value:', bodyValue);

            const decryptedData = decryptData(bodyValue);
            console.log('Decrypted Data:', decryptedData);

            const { id } = decryptedData;

            const user = await User.findOne({ chatId: userId }, 'runes score username');
            if (!user) {
                return res.status(404).send({ message: "User not found" });
            }

            // Initialize user.runes if it's undefined
            if (!Array.isArray(user.runes)) {
                user.runes = [];
            }

            const currentTime = new Date();
            if (user.expirationDate && new Date(user.expirationDate) < currentTime) {
                return res.status(400).send({ message: "The user's expiration date has passed" });
            }

            // Find the rune from runesTemplateData
            const runeTemplate = runesTemplateData.runes.find(r => r._id === id);
            if (!runeTemplate) {
                return res.status(404).send({ message: "Rune not found" });
            }

            const runePrice = Number(runeTemplate.price);

            // Ensure user.score and runePrice are valid numbers
            user.score = Number(user.score);
            if (isNaN(user.score) || isNaN(runePrice)) {
                return res.status(500).send({ message: "Invalid score or price value" });
            }

            if (user.score < runePrice) {
                return res.status(400).send({ message: "Insufficient funds to purchase the rune" });
            }

            if (user.runes.includes(runeTemplate._id)) {
                return res.status(400).send({ message: "Rune already purchased" });
            }

            user.score -= runePrice;
            user.runes.push(runeTemplate._id);

            await user.save();
            const userAgentString = req.headers['user-agent'];
            addToBuffer(req.params.userId, user.username, `buy rune ${runeTemplate.title}`, userAgentString, user.score);
            return res.json({ message: `Rune "${runeTemplate.title}" purchased successfully`, userRunes: user.runes, score: user.score });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Internal server error" });
        }
    }


}

module.exports = new RunesController();

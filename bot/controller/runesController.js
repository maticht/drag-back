const { User } = require("../../models/user");
const { Runes } = require("../../models/runes");
const runesTemplateData = require('../../eggsTemplateData/runesTemplateData.json')
const {addToBuffer} = require("../../utils/clickHouse/dataBuffer");

class RunesController {
    async getUserRunes(req, res) {
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'runes');
            if (!user) return res.status(400).send({ message: "Invalid queryId" });

            const initialUserRunes = [
                { title: "Dagaz", codeName: "D", wasBought: false },
                { title: "Raidho", codeName: "R", wasBought: false },
                { title: "Ansuz", codeName: "A", wasBought: false },
                { title: "Kaunan", codeName: "K", wasBought: false },
                { title: "Othala", codeName: "O", wasBought: false },
                { title: "Naudiz", codeName: "N", wasBought: false }
            ];

            if (!user.runes || user.runes.length === 0) {
                user.runes = initialUserRunes;
                await user.save();
                return res.json({ runes: initialUserRunes });
            }

            return res.json({ runes: user.runes });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Внутренняя ошибка сервера" });
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
            res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    }

    async getAvailableRune(req, res) {
        try {
            const currentDate = new Date();
            const availableRune = await Runes.findOne({ isAvailable: true, expirationDate: { $gt: currentDate } });
            if (!availableRune) {
                return res.status(404).send({ message: "No available rune found" });
            }
            return res.json({ rune: availableRune });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Internal server error" });
        }
    }

    async buyRune(req, res) {
        try {
            const { userId } = req.params;
            const { title } = req.body;

            const user = await User.findOne({ chatId: userId }, 'runes score username');
            if (!user) {
                return res.status(404).send({ message: "User not found" });
            }

            const currentTime = new Date();
            if (user.expirationDate && new Date(user.expirationDate) < currentTime) {
                return res.status(400).send({ message: "The user's expiration date has passed" });
            }

            const rune = runesTemplateData.runes.find(r => r.title === title);
            if (!rune) {
                return res.status(404).send({ message: "Rune not found" });
            }

            if (user.score < rune.price) {
                return res.status(400).send({ message: "Insufficient funds to purchase the rune" });
            }

            const userRune = user.runes.find(r => r.title === title);
            if (userRune && userRune.wasBought) {
                return res.status(400).send({ message: "Rune already purchased" });
            }

            user.score -= rune.price;

            if (userRune) {
                userRune.wasBought = true;
            } else {
                user.runes.push({ title: rune.title, codeName: rune.codeName, wasBought: true });
            }

            await user.save();

            return res.json({ message: `Rune "${rune.title}" purchased successfully`, user });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Internal server error" });
        }
    }

}

module.exports = new RunesController();
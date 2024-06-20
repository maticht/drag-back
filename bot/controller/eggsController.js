const {User} = require("../../models/user");
const getRandomEgg = require("../../utils/helpers");
const compareRarities = (rarity1, rarity2) => {
    const rarityOrder = ['Common', 'Rare', 'Epic', 'Mythical', 'Legendary'];
    return rarityOrder.indexOf(rarity1) >= rarityOrder.indexOf(rarity2);
};
class EggsController {

    async modalFlag(req, res, next) {
        try {
            const userId = req.params.userId;
            const user = await User.findOne({ chatId: userId });

            if (!user) {
                return res.status(404).send({ message: "User not found" });
            }

           user.eggs[0].isModalShown = true;

            const savedUser = await user.save();
            return res.status(200).json({ savedUser });
        } catch (error) {
            // Обработка ошибок
            console.log(error);
            return res.status(500).send({ message: "Internal server error" });
        }
    }

    async scene(req, res){
        try {
            const user = await User.findOne({ chatId: req.params.userId });
            if (!user) return res.status(400).send({ message: "Invalid queryId" });
            if (!user.narrativeScenes.gettingEgg) {
                user.narrativeScenes.gettingEgg = true;
            }
            await user.save();

            return res.json({ user });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }


    async alchemistUpgrade(req, res){
        try {
            const user = await User.findOne({ chatId: req.params.userId });
            if (!user) return res.status(400).send({ message: "Invalid queryId" });

            let egg = getRandomEgg();

            while (!compareRarities(egg.rarity, user.eggs[0].rarity)) {
                egg = getRandomEgg();
            }

            user.eggs[0].rarity = egg.rarity;
            user.score -= 2000;
            await user.save();
            return res.json({ user });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }
}


module.exports = new EggsController()
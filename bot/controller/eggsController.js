const {User} = require("../../models/user");
const {getRandomEgg} = require("../../utils/helpers");
const {addToBuffer} = require("../../utils/clickHouse/dataBuffer");
const compareRarities = (rarity1, rarity2) => {
    const rarityOrder = ['Common', 'Rare', 'Epic', 'Mythical', 'Legendary'];
    return rarityOrder.indexOf(rarity1) >= rarityOrder.indexOf(rarity2);
};
class EggsController {

    async modalFlag(req, res, next) {
        try {
            const userId = req.params.userId;

            const updatedUser = await User.findOneAndUpdate(
                { chatId: userId, 'eggs.0': { $exists: true } },
                { $set: { 'eggs.0.isModalShown': true } },
                {
                    new: true, // возвращаем обновленный документ
                    projection: { 'eggs': 1, _id: 0 }
                }
            );

            console.log(updatedUser)

            if (!updatedUser) {
                return res.status(404).send({ message: "User not found or no eggs available" });
            }

            const userAgentString = req.headers['user-agent'];
            addToBuffer(userId, "open egg", userAgentString, null);

            return res.status(200).json({ isModalShown: updatedUser.eggs[0].isModalShown });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: "Internal server error" });
        }
    }

    async scene(req, res) {
        try {
            const userId = req.params.userId;

            const updatedUser = await User.findOneAndUpdate(
                { chatId: userId },
                {
                    $set: {
                        'narrativeScenes.gettingEgg': true,
                        'eggs.0.isOpen': true
                    }
                },
                {
                    new: true, // возвращаем обновленный документ
                    projection: { 'narrativeScenes': 1, 'eggs': 1, _id: 0 } // исправленная проекция
                }
            );

            if (!updatedUser) {
                return res.status(404).send({ message: "User not found" });
            }

            const userAgentString = req.headers['user-agent'];
            addToBuffer(req.params.userId, `narrative scene egg`, userAgentString, null);


            return res.status(200).json({ narrativeScenes: updatedUser.narrativeScenes, isEggOpen: updatedUser.eggs[0].isOpen });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: "Internal Server Error" });
        }
    }


    async alchemistUpgrade(req, res){
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'eggs score');
            if (!user) return res.status(400).send({ message: "Invalid queryId" });

            let egg = getRandomEgg();

            while (!compareRarities(egg.rarity, user.eggs[0].rarity)) {
                egg = getRandomEgg();
            }

            let success;
            if(user.eggs[0].rarity === egg.rarity){
                success = 0;
            }else{
                success = 1;
            }

            user.eggs[0].rarity = egg.rarity;
            user.score -= 1000000;
            await user.save();


            const userAgentString = req.headers['user-agent'];
            addToBuffer(req.params.userId, `alchemist upgrade ${success}`, userAgentString, null);

            return res.json({ eggRarity: egg.rarity, score: user.score });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }
}


module.exports = new EggsController()
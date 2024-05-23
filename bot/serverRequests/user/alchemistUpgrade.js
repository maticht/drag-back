const router = require("express").Router();
const { User } = require("../../../models/user");
const getRandomEgg = require("../../../utils/helpers");

router.put("/:userid/", async (req, res) => {
    try {
        const user = await User.findOne({ chatId: req.params.userid });
        if (!user) return res.status(400).send({ message: "Invalid queryId" });

        const egg = getRandomEgg();
        user.eggs[0].rarity = egg.rarity;
        user.score -= 2000;
        await user.save();
        return res.json({user})
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;
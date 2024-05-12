const router = require("express").Router();
const { User } = require("../../models/user");

router.put("/:userid/", async (req, res) => {
    try {
        const user = await User.findOne({ chatId: req.params.userid });
        if (!user) return res.status(400).send({ message: "Invalid queryId" });

        const hammer = user.hammer;
        const currentLevel = hammer.currentLevel;
        const price = hammer.price[currentLevel - 1];
        if (user.score < price) return res.status(400).send({ message: "not enough money" });
        if (currentLevel < 8) {
            hammer.currentLevel++;
            user.score -= price;
        } else {
            return res.status(400).send({ message: "Maximum level reached" });
        }
        await user.save();
        return res.json({user})
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;

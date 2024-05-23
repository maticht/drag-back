const router = require("express").Router();
const { User } = require("../../models/user");

router.put("/:userid/", async (req, res) => {
    try {
        const user = await User.findOne({ chatId: req.params.userid });
        if (!user) return res.status(400).send({ message: "Invalid queryId" });

        const axe = user.axe;
        const currentLevel = axe.currentLevel;
        const price = axe.price[currentLevel - 1];
        if (user.score < (price * 10)) return res.status(400).send({ message: "not enough money" });
        if (currentLevel < 8) {
            axe.currentLevel++;
            user.score -= (price * 10);
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

const router = require("express").Router();
const { User } = require("../../../models/user");

router.put("/:userId/", async (req, res) => {
    try {
        const user = await User.findOne({ chatId: req.params.userId }, 'narrativeScenes');
        if (!user) return res.status(400).send({ message: "Invalid queryId" });
        if (!user.narrativeScenes.firstGoblinGame) {
            user.narrativeScenes.firstGoblinGame = true;
        }
        await user.save();

        return res.json({ narrativeScenes: user.narrativeScenes});
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;
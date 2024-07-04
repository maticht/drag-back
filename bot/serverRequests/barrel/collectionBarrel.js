const router = require("express").Router();
const { User } = require("../../../models/user");

router.put("/:userid/", async (req, res) => {
    try {
        const user = await User.findOne({ chatId: req.params.userid });
        if (!user) return res.status(400).send({ message: "Invalid queryId" });
        const barrel = user.barrel;
        const currentLevel = barrel.currentLevel;
        const waitingTime = barrel.waitingTime[currentLevel - 1];

        barrel.lastEntrance = new Date();
        const collectionTime = new Date();
        collectionTime.setTime(collectionTime.getTime() + waitingTime * 60000);
        barrel.collectionTime = collectionTime;
        user.score += barrel.income[currentLevel - 1];
        user.overallScore += barrel.income[currentLevel - 1];
        user.eggs[0].score += storeBarrelData.income[currentLevel - 1] * 0.5;
        await user.save();
        return res.json({lastEntrance: barrel.lastEntrance, collectionTime, score: user.score, overallScore: user.overallScore, success:true})
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;

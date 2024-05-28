const router = require("express").Router();
const { User } = require("../../../models/user");

router.get("/:userid/", async (req, res) => {
    try {
        const user = await User.findOne({ chatId: req.params.userid });
        if (!user) return res.status(400).send({ message: "Invalid userId" });

        const now = new Date();
        const nextRewardIndex = user.dailyReward.findIndex(reward => !reward.isRewardTaken);

        if (nextRewardIndex > 0) {
            const nextRewardDate = new Date(user.dailyReward[nextRewardIndex + 1].dateOfAward);
            if (now >= nextRewardDate) {
                // If the next reward was missed, reset all rewards
                user.dailyReward.forEach(reward => {
                    reward.isRewardTaken = false;
                    reward.dateOfAward = 0;
                });
                await user.save();
                return res.status(200).send({ message: "Rewards reset due to missed reward" });
            }
        }

        return res.status(200).send({ message: "No missed rewards" });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;
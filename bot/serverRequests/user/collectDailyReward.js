const router = require("express").Router();
const { User } = require("../../../models/user");

router.put("/:userid/", async (req, res) => {
    try {
        const user = await User.findOne({ chatId: req.params.userid });
        if (!user) return res.status(400).send({ message: "Invalid userId" });

        let dailyRewardsArr = [500, 1000, 1500, 2000, 2500, 3000, 3500];
        let now = new Date();
        let rewardIndex = user.dailyReward.findIndex(reward => !reward.isRewardTaken);

        if (rewardIndex === 0) {
            let nextRewardTime = now.getTime() + (2 * 60 * 1000);
            user.dailyReward.forEach((reward, index) => {
                reward.isRewardTaken = false;
                reward.dateOfAward = nextRewardTime;
                if (index !== 0) {
                    nextRewardTime += (2 * 60 * 1000);
                }
            });
            rewardIndex = 0;
        }

        if (rewardIndex > 0) {
            let nextRewardDate = new Date(user.dailyReward[rewardIndex].dateOfAward);
            let unlockTime = new Date(nextRewardDate.getTime());
            if (now < unlockTime) {
                return res.status(400).send({ message: "Reward is not yet available" });
            }
        }

        user.dailyReward[rewardIndex].isRewardTaken = true;
        user.dailyReward[rewardIndex].dateOfAward = now.getTime();
        user.score = (user.score || 0) + dailyRewardsArr[rewardIndex];

        if (rewardIndex === user.dailyReward.length - 1) {
            let nextRewardTime = now.getTime() + (2 * 60 * 1000);
            user.dailyReward.forEach((reward, index) => {
                reward.isRewardTaken = false;
                reward.dateOfAward = nextRewardTime;
                nextRewardTime += (2 * 60 * 1000);
            });
        }

        await user.save();
        return res.json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;




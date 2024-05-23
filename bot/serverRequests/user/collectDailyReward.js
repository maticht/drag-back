const router = require("express").Router();
const { User } = require("../../../models/user");

router.put("/:userid/", async (req, res) => {
    try {
        const user = await User.findOne({ chatId: req.params.userid });
        if (!user) return res.status(400).send({ message: "Invalid queryId" });

        let dailyRewardsArr = [500, 1000, 1500, 2000, 2500, 3000, 3500];
        let now = new Date();
        let rewardDay = null;
        let resetRewards = false;

        for (let i = 2; i <= 7; i++) {
            let dayKey = `day${i}`;
            if (now >= new Date(user.dailyReward[dayKey].dateOfAward) && !user.dailyReward[dayKey].isRewardTaken) {
                resetRewards = true;
                break;
            }
        }

        if (resetRewards) {
            for (let i = 1; i <= 7; i++) {
                let dayKey = `day${i}`;
                user.dailyReward[dayKey].isRewardTaken = false;
                user.dailyReward[dayKey].dateOfAward = 0;
            }
        }

        for (let i = 1; i <= 7; i++) {
            let dayKey = `day${i}`;
            if (!user.dailyReward[dayKey].isRewardTaken) {
                let dateOfAward = new Date(user.dailyReward[dayKey].dateOfAward);
                if (i === 1 || now >= dateOfAward) {
                    rewardDay = dayKey;
                    break;
                }
            }
        }

        if (rewardDay) {
            user.dailyReward[rewardDay].isRewardTaken = true;
            user.dailyReward[rewardDay].dateOfAward = now;
            user.score += dailyRewardsArr[parseInt(rewardDay.slice(3)) - 1];

            for (let i = parseInt(rewardDay.slice(3)) + 1; i <= 7; i++) {
                let nextDay = new Date(now);
                nextDay.setDate(now.getDate() + (i - parseInt(rewardDay.slice(3))));
                nextDay.setHours(0, 5, 0, 0);
                user.dailyReward[`day${i}`].dateOfAward = nextDay;
            }

            await user.save();
            return res.json({ user });
        } else {
            return res.status(400).send({ message: "No rewards available or already collected all rewards" });
        }

    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;




const {User} = require("../../models/user");

class DailyRewardsController {
    async collect(req, res) {
        try {
            const user = await User.findOne({chatId: req.params.userId}, 'score overallScore dailyReward miniGameKeys');
            if (!user) return res.status(400).send({message: "Invalid userId"});

            let dailyRewardsArr = [500, 1000, 1500, 2000, 2500, 3000, 3500];
            let dailyGameKeysArr = [3, 4, 5, 6, 7, 8, 10];
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
                    return res.status(400).send({message: "Reward is not yet available"});
                }
            }

            user.dailyReward[rewardIndex].isRewardTaken = true;
            // user.dailyReward[rewardIndex].dateOfAward = now.getTime();
            user.score = (user.score || 0) + dailyRewardsArr[rewardIndex];
            user.overallScore = (user.score || 0) + dailyRewardsArr[rewardIndex];
            user.miniGameKeys = (user.miniGameKeys || 0) + dailyGameKeysArr[rewardIndex];

            if (rewardIndex === user.dailyReward.length - 1) {
                let nextRewardTime = now.getTime() + (2 * 60 * 1000);
                user.dailyReward.forEach((reward, index) => {
                    reward.isRewardTaken = false;
                    reward.dateOfAward = nextRewardTime;
                    nextRewardTime += (2 * 60 * 1000);
                });
            }

            await user.save();
            return res.json({
                score: user.score,
                overallScore: user.overallScore,
                dailyReward: user.dailyReward,
                miniGameKeys: user.miniGameKeys
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({message: "Internal Server Error"});
        }
    }

    async checkRewards(req, res) {
        try {
            const user = await User.findOne({chatId: req.params.userId}, 'dailyReward');
            if (!user) return res.status(400).send({message: "Invalid userId"});

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
                    return res.json({dailyReward: user.dailyReward, message: "Rewards reset due to missed reward"});
                }
            }

            return res.json({dailyReward: user.dailyReward, message: "No missed rewards"});
        } catch (error) {
            console.error(error);
            res.status(500).send({message: "Internal Server Error"});
        }
    }
}


module.exports = new DailyRewardsController()
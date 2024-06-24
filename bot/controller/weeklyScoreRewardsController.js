const {User} = require("../../models/user");

class WeeklyScoreRewardsController {
    async claim(req, res, next) {
        try {
            console.log(req.body);
            const user = await User.findOne({chatId: req.body.userId});
            console.log(user)
            const rewardId = req.body.rewardId;
            const currentWeeklyReward = user.weeklyScoreRewards.find(reward => reward._id.toString() === rewardId);
            console.log(currentWeeklyReward)
            if (!currentWeeklyReward) {
                return res.status(404).send({ message: "Reward not found" });
            }

            const rewardValue = currentWeeklyReward.rewardValue;
            console.log('Reward Value:', rewardValue);
            const rewardClaimedDate = Date.now();

            // Обновляем статус награды и добавляем дату получения
            currentWeeklyReward.isTaken = true;
            currentWeeklyReward.rewardClaimedDate = rewardClaimedDate;

            console.log(user.overallScore);
            console.log(user.score)

            // Обновляем счет пользователя
            user.score += rewardValue;
            user.overallScore += rewardValue;

            console.log(user.overallScore);
            console.log(user.score)

            const savedUser = await user.save();
            return res.status(201).send({message: "Счет обновлен успешно", success: true});
        } catch (error) {
            console.log(error);
            res.status(500).send({message: "Внутренняя ошибка сервера", success: false});
        }
    }
    async checkRewards(req, res, next) {
        try {
            const userId = req.params.userId;
            const user = await User.findOne({ chatId: userId });

            if (!user) {
                return res.status(404).send({ message: "User not found" });
            }

            // Получение неполученной награды пользователя
            const unclaimedReward = user.weeklyScoreRewards.find(reward => !reward.isTaken);

            if (!unclaimedReward) {
                return res.status(404).send({ message: "No unclaimed rewards found" });
            }

            return res.status(200).json({ unclaimedReward });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "Internal server error" });
        }
    }
}


module.exports = new WeeklyScoreRewardsController()
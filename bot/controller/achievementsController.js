const { User } = require("../../models/user");
const { Achievement } = require("../../models/achievements");
const mongoose = require('mongoose');

class AchievementsController {

    async getAchievements(req, res) {
        try {
            const user = await User.findOne({ chatId: req.params.userId });
            const allAchievements = await Achievement.find().select('-__v');
            return res.json({ achievements: allAchievements });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    }

    async createAchievements(req, res) {
        try {
            const { title, description, reward, image, rarity } = req.body;
            const achievement = new Achievement({ title, description, reward, image, rarity });
            await achievement.save();
            return res.json({ message: `Achievement "${achievement.title}" created successfully` });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    }

    async completeAchievement(req, res) {
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'completedAchievements');
            if (!user) {
                return res.json({ message: `"User not found"` });
            }

            console.log(req.body.achievementId)

            // const achievement = await Achievement.findById(req.body.achievementId).session(session);
            // if (!achievement) {
            //     throw new Error("Achievement not found");
            // }
            console.log(user.completedAchievements)

            if (user.completedAchievements.includes(req.body.achievementId)) {
                return res.json({success: false, message: `"Achievement already completed"` });
            }

            // user.score += achievement.reward;
            // user.overallScore += achievement.reward;

            user.completedAchievements.push(req.body.achievementId);
            await user.save();

            return res.json({
                message: `Achievement completed successfully`,
                success: true,
                // score: user.score,
                // overallScore: user.overallScore,
                completedAchievementId: req.body.achievementId,
                // achievement: {
                //     title: achievement.title,
                //     description: achievement.description,
                //     reward: achievement.reward,
                //     image: achievement.image,
                //}
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    }
}

module.exports = new AchievementsController();
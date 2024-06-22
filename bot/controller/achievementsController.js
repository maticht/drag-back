const { User } = require("../../models/user");
const { Achievement } = require("../../models/achievements");
const mongoose = require('mongoose');

class AchievementsController {

    async getAchievements(req, res) {
        try {
            const user = await User.findOne({ chatId: req.params.userId });
            const allAchievements = await Achievement.find();
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
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const user = await User.findOne({ chatId: req.params.userId }).session(session);
            if (!user) {
                throw new Error("User not found");
            }

            const achievement = await Achievement.findById(req.body.achievementId).session(session);
            if (!achievement) {
                throw new Error("Achievement not found");
            }

            if (user.completedAchievements.includes(req.body.achievementId)) {
                throw new Error("Achievement already completed");
            }

            let userScores = await User.findOneAndUpdate(
                { chatId: req.params.userId },
                { $inc: { score: achievement.reward, overallScore: achievement.reward } },
                { new: true, session }
            );

            if (!userScores) {
                throw new Error("User scores not found");
            }

            user.completedAchievements.push(req.body.achievementId);
            await user.save({ session });

            await session.commitTransaction();
            session.endSession();

            return res.json({
                message: `Achievement completed successfully`,
                score: userScores.score,
                overallScore: userScores.overallScore,
                completedAchievementId: req.body.achievementId,
                achievement: {
                    title: achievement.title,
                    description: achievement.description,
                    reward: achievement.reward,
                    image: achievement.image,
                }
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.log(error);
            res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    }
}

module.exports = new AchievementsController();
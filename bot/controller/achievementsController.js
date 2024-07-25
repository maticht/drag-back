const { User } = require("../../models/user");
const { Achievement } = require("../../models/achievements");
const mongoose = require('mongoose');
const {decryptData} = require("../../utils/helpers");
const Joi = require('joi');
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
            const { bodyValue } = req.body;

            const decryptedData = decryptData(bodyValue);

            const schema = Joi.object({
                timestamp: Joi.date().required(),
                achievementId: Joi.string().required()
            });

            const { error, value } = schema.validate(decryptedData);
            if (error) {
                return res.status(400).send({ message: "Invalid data", details: error.details });
            }

            const { achievementId } = value;

            const user = await User.findOne({ chatId: req.params.userId }, 'completedAchievements');
            if (!user) {
                return res.json({ message: `"User not found"` });
            }

            if (user.completedAchievements.includes(achievementId)) {
                return res.json({success: false, message: `"Achievement already completed"` });
            }

            user.completedAchievements.push(achievementId);
            await user.save();

            return res.json({
                message: `Achievement completed successfully`,
                success: true,
                completedAchievementId: achievementId,
            });
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    }
}

module.exports = new AchievementsController();
const {User} = require("../../models/user");
const {checkLevel} = require("../../utils/helpers");
const rewardsTemplateData = require("../../eggsTemplateData/rewardsTemplateData.json")
const mongoose = require('mongoose');

class UserController {
    async getUserData(req, res){
        try {
            const user = await User.findOne({ chatId: req.params.userId });
            console.log(req.params.userId)
            if (!user) return res.status(400).send({ message: "Invalid queryId" });
            return res.json({user})
        } catch (error) {
            res.status(500).send({ message: "Internal Server Error" });
        }
    }

    async getAllUsersForScoreTop(req, res){
        try {
            const currentUserId = req.params.userId;

            const users = await User.find({}, 'overallScore username chatId').sort({ overallScore: -1 });

            const scoreRewards = rewardsTemplateData.weeklyScoreRewards;

            const userIndex = users.findIndex(user => user.chatId.toString() === currentUserId);

            if (userIndex === -1) {
                return res.status(404).send({ message: "User not found" });
            }

            const placeInTop = userIndex + 1;

            const userLeague = scoreRewards.find(r => placeInTop >= r.placeInTop[0] && placeInTop <= r.placeInTop[1]);

            const currentUser = {
                placeInTop: placeInTop,
                league: userLeague ? userLeague.league : 'Unranked',
                // overallScore: users[userIndex].overallScore,
                // username: users[userIndex].username
            };

            res.status(200).send({ users: users.slice(0, 1000), currentUser });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }

    async getAllUsersForReferralTop(req, res) {
        try {
            const currentUserId = req.params.userId;

            // Находим всех пользователей и считаем количество рефералов
            const users = await User.aggregate([
                {
                    $addFields: {
                        referralsCount: { $size: "$referrals.referralUsers" }
                    }
                },
                {
                    $project: {
                        username: 1,
                        chatId: 1,
                        referralsCount: 1
                    }
                },
                {
                    $sort: { referralsCount: -1 }
                }
            ]);

            const referralRewards = rewardsTemplateData.weeklyReferralRewards;

            const userIndex = users.findIndex(user => user.chatId.toString() === currentUserId);

            if (userIndex === -1) {
                return res.status(404).send({ message: "User not found" });
            }

            const placeInTop = userIndex + 1;

            const userLeague = referralRewards.find(r => placeInTop >= r.placeInTop[0] && placeInTop <= r.placeInTop[1]);

            const currentUser = {
                placeInTop: placeInTop,
                league: userLeague ? userLeague.league : 'Unranked',
                referralsCount: users[userIndex].referralsCount,
                username: users[userIndex].username
            };

            res.status(200).send({ users: users.slice(0, 1000), currentUser });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }

    async getAllUsersForMiniGameTop(req, res) {
        try {

            const currentUserId = req.params.userId;

            const users = await User.find({}, 'miniGame.dailyBestScore username chatId').sort({ "miniGame.dailyBestScore": -1 });

            const scoreRewards = rewardsTemplateData.weeklyScoreRewards;

            const userIndex = users.findIndex(user => user.chatId.toString() === currentUserId);

            if (userIndex === -1) {
                return res.status(404).send({ message: "User not found" });
            }

            const placeInTop = userIndex + 1;

            const userLeague = scoreRewards.find(r => placeInTop >= r.placeInTop[0] && placeInTop <= r.placeInTop[1]);

            const currentUser = {
                placeInTop: placeInTop,
                league: userLeague ? userLeague.league : 'Unranked',
            };

            res.status(200).send({ users: users.slice(0, 1000), currentUser });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }

    async updateWalletHash(req, res){
        try {
            const { userId } = req.params;
            const { auroraWalletHash } = req.body;

            if (!auroraWalletHash && auroraWalletHash !== "") {
                return res.status(400).send({ message: "Invalid wallet hash" });
            }

            const user = await User.findOneAndUpdate(
                { chatId: userId },
                { auroraWalletHash: auroraWalletHash || "" },
                { new: true, select: 'auroraWalletHash' }
            );

            if (!user) {
                return res.status(404).send({ message: "User not found" });
            }

            return res.json({ auroraWalletHash: user.auroraWalletHash });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }
    async updateProfileLevel(req, res){
        try {
            const { userId } = req.params;
            const { profileLevel } = req.body;

            if (!profileLevel && profileLevel !== "") {
                return res.status(400).send({ message: "Invalid level", success: false });
            }

            const user = await User.findOne({ chatId: userId }, 'score overallScore referrals completedAchievements miniGame barrel');

            if (!user) {
                return res.status(404).send({ message: "User not found", success: false });
            }

            if(!checkLevel(user, profileLevel)){
                return res.status(400).send({ message: "Level check failed", success: false });
            }

            user.profileLevel = profileLevel + 1;

            await user.save();

            return res.json({ success: true, profileLevel: user.profileLevel });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }

    async updateScoreAndEnergy(req, res) {
        try {
            const { userId, energyRestoreTime, value, score, overallScore, eggScore } = req.body;

            const updateFields = {
                'energy.energyFullRecoveryDate': energyRestoreTime,
                'energy.value': value,
                'score': score,
                'overallScore': overallScore,
                'eggs.0.score': eggScore,
                ...(eggScore >= 88 ? { 'eggs.0.isOpen': true } : {})
            };

            const result = await User.updateOne(
                {
                    chatId: userId,
                },
                { $set: updateFields }
            );

            if (result.nModified === 0) {
                return res.status(404).send({ message: "User not found or no update needed" });
            }

            return res.status(200).send({ message: "Счет и дата восстановления энергии обновлены успешно" });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    }
}

module.exports = new UserController();
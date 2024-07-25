const {User} = require("../../models/user");
const {checkLevel, decryptData} = require("../../utils/helpers");
const rewardsTemplateData = require("../../eggsTemplateData/rewardsTemplateData.json")
const mongoose = require('mongoose');
const {addToBuffer} = require("../../utils/clickHouse/dataBuffer");
const {languageMap} = require("../../utils/localization");
const Joi = require('joi');

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



    async getUserDataLoadingScreen(req, res) {
        try {
            // Извлечение и расшифровка данных
            const { bodyValue } = req.body;
            console.log(bodyValue)

            const decryptedData = decryptData(bodyValue);
            console.log(decryptedData)

            const schema = Joi.object({
                timestamp: Joi.date().required(),
                isLoadingScreen: Joi.boolean().required()
            });

            const { error, value } = schema.validate(decryptedData);
            if (error) {
                return res.status(400).send({ message: "Invalid data", details: error.details });
            }
            console.log(value)

            const { isLoadingScreen } = value;

            const user = await User.findOne({ chatId: req.params.userId });
            if (!user) return res.status(400).send({ message: "Invalid userId" });

            if (isLoadingScreen) {
                const userAgentString = req.headers['user-agent'];
                addToBuffer(req.params.userId, user.username, `open bot`, userAgentString, user.score);
            }

            return res.json({ user });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: "Internal Server Error" });
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

            res.status(200).send({ users: users.slice(0, 1000), currentUser, allUsersLength: users.length });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }

    async getAllUsersForReferralTop(req, res) {
        try {
            const currentUserId = req.params.userId;

            const users = await User.aggregate([
                {
                    $match: {
                        'referrals.referralUsers': { $ne: [] } // Фильтр: только пользователи с непустым массивом referralUsers
                    }
                },
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
                const currentUser = {
                    placeInTop: "You are not in top",
                    league: null,
                    referralsCount: 0,
                    //username: users[userIndex].username
                };
                return res.send({users: users.slice(0, 1000), currentUser, allUsersLength: users.length });
            }

            const placeInTop = userIndex + 1;

            const userLeague = referralRewards.find(r => placeInTop >= r.placeInTop[0] && placeInTop <= r.placeInTop[1]);

            const currentUser = {
                placeInTop: placeInTop,
                league: userLeague ? userLeague.league : null,
                referralsCount: users[userIndex].referralsCount,
                username: users[userIndex].username,
            };

            res.status(200).send({ users: users.slice(0, 1000), currentUser, allUsersLength: users.length });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }

    async getAllUsersForMiniGameTop(req, res) {
        try {

            const currentUserId = req.params.userId;

            const users = await User.find({ 'miniGame.dailyBestScore': { $ne: 0 } }, 'miniGame.dailyBestScore username chatId')
                .sort({ "miniGame.dailyBestScore": -1 });

            const miniGameRewards = rewardsTemplateData.dailyGameRewards;

            const userIndex = users.findIndex(user => user.chatId.toString() === currentUserId);

            if (userIndex === -1) {
                const currentUser = {
                    placeInTop: "You are not in top",
                    allUsersLength: users.length,
                    league: null,
                };
                return res.status(200).send({ users: users.slice(0, 1000), currentUser });
            }

            const placeInTop = userIndex + 1;

            const userLeague = miniGameRewards.find(r => placeInTop >= r.placeInTop[0] && placeInTop <= r.placeInTop[1]);

            const currentUser = {
                placeInTop: placeInTop,
                league: userLeague ? userLeague.league : 'Unranked',
            };

            res.status(200).send({ users: users.slice(0, 1000), currentUser, allUsersLength: users.length });
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
            const { bodyValue } = req.body;
            console.log(bodyValue)


            const decryptedData = decryptData(bodyValue);
            console.log(decryptedData)

            const schema = Joi.object({
                timestamp: Joi.date().required(),
                profileLevel: Joi.number().integer().required()
            });

            const { error, value } = schema.validate(decryptedData);
            if (error) {
                return res.status(400).send({ message: "Invalid data", details: error.details, success: false });
            }
            console.log(value)

            const { profileLevel } = value;
            console.log(value)

            if (!profileLevel && profileLevel !== "") {
                return res.status(400).send({ message: "Invalid level", success: false });
            }

            const user = await User.findOne({ chatId: userId }, 'score overallScore referrals completedAchievements miniGame barrel score username');

            if (!user) {
                return res.status(404).send({ message: "User not found", success: false });
            }

            if(!checkLevel(user, profileLevel)){
                return res.status(400).send({ message: "Level check failed", success: false });
            }

            user.profileLevel = profileLevel + 1;

            await user.save();

            const userAgentString = req.headers['user-agent'];
            addToBuffer(req.params.userId, user.username,`level up ${profileLevel + 1}`, userAgentString, user.score);

            return res.json({ success: true, profileLevel: user.profileLevel });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error", success: false });
        }
    }

    async updateScoreAndEnergy(req, res) {
        try {

            const { bodyValue } = req.body;
            console.log(bodyValue)


            // Расшифровка данных
            const decryptedData = decryptData(bodyValue);
            console.log(decryptedData)

            // Схема валидации
            const schema = Joi.object({
                timestamp: Joi.date().required(),
                userId: Joi.string().required(),
                energyRestoreTime: Joi.date().required(),
                value: Joi.number().required(),
                score: Joi.number().required(),
                overallScore: Joi.number().required(),
                eggScore: Joi.number().required()
            });

            // Валидация данных
            const { error, value } = schema.validate(decryptedData);
            if (error) {
                return res.status(400).send({ message: error.details[0].message });
            }
            console.log(value)

            const { userId, energyRestoreTime, value: energyValue, score, overallScore, eggScore } = value;

            console.log('Encrypted Value:', bodyValue);
            console.log('Decrypted Data:', decryptData(bodyValue));

            const updateFields = {
                'energy.energyFullRecoveryDate': energyRestoreTime,
                'energy.value': energyValue,
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
    async changeLanguage(req, res){
        try {
            const { userId } = req.params;
            const { languageCode } = req.body;

            if (!languageCode) {
                return res.status(400).send({ message: "Invalid language code" });
            }

            const user = await User.findOneAndUpdate(
                { chatId: userId },
                { language: languageCode || "en" },
                { new: true, select: 'language' }
            );

            languageMap.set(userId.toString(), languageCode || 'en');

            if (!user) {
                return res.status(404).send({ message: "User not found" });
            }

            return res.json({ language: user.language });
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }
}

module.exports = new UserController();
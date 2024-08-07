const {User} = require("../../models/user");
const {addToBuffer} = require("../../utils/clickHouse/dataBuffer");
const {decryptData} = require("../../utils/helpers");
const Joi = require('joi');
const {TournamentReward} = require("../../models/tournamentReward");

class TournamentRewardController {
    async claim(req, res, next) {
        try {
            const { bodyValue } = req.body;
            console.log(bodyValue)

            const decryptedData = decryptData(bodyValue);
            console.log(decryptedData)

            // const schema = Joi.object({
            //     timestamp: Joi.date().required(),
            //     userId: Joi.string().required(),
            //     rewardId: Joi.string().required()
            // });
            //
            // const { error, value } = schema.validate(decryptedData);
            // if (error) {
            //     return res.status(400).send({ message: "Invalid data", details: error.details, success: false });
            // }
            // console.log(value)
            // Извлечение данных после валидации


            const { userId, rewardId } = decryptedData;

            const user = await User.findOne({chatId: userId}, 'chatId username realMoneyReward');
            if(!user) {
                return res.status(404).send({message: "User not found"});
            }

            const currentTournamentReward = await TournamentReward.findOne({chatId: userId, isTaken: false});
            console.log(currentTournamentReward)
            if (!currentTournamentReward) {
                return res.status(200).send({ message: "Reward not found" });
            }
            if (currentTournamentReward.isAvailable === false) {
                return res.status(200).send({ message: "Reward unavailable" });
            }
            if (currentTournamentReward.isTaken === true) {
                return res.status(200).send({ message: "Reward already taken" });
            }

            const rewardClaimedDate = Date.now();

            currentTournamentReward.isTaken = true;
            currentTournamentReward.rewardClaimedDate = rewardClaimedDate;
            user.realMoneyReward.usd += currentTournamentReward.usd;
            user.realMoneyReward.auroraTokens += currentTournamentReward.auroraTokens;

            const savedTournamentReward = await currentTournamentReward.save();
            const savedUser = await user.save();

            const userAgentString = req.headers['user-agent'];
            addToBuffer(userId, user.username, `collect tournament reward`, userAgentString, user.score);

            return res.status(201).send({message: "Tournament reward claimed successfully", success: true, user: savedUser, reward: currentTournamentReward});
        } catch (error) {
            console.log(error);
            res.status(500).send({message: "Внутренняя ошибка сервера", success: false});
        }
    }
    async checkRewards(req, res, next) {
        try {
            const userId = req.params.userId;
            const currentTournamentReward = await TournamentReward.findOne({chatId: userId});

            if (!currentTournamentReward) {
                return res.status(404).send({ message: "Reward not found" });
            }

            return res.status(200).json({ unclaimedReward: currentTournamentReward });
        } catch (error) {
            console.log(error);
            return res.status(500).send({ message: "Internal server error" });
        }
    }
}


module.exports = new TournamentRewardController()
const { User } = require("../../models/user");
const mongoose = require('mongoose');
const {addToBuffer} = require("../../utils/clickHouse/dataBuffer");
const {decryptData} = require("../../utils/helpers");
const Joi = require('joi');
class miniGameController {

    async startGame(req, res) {
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'miniGameKeys score username');

            if (user.miniGameKeys > 0) {
                user.miniGameKeys -= 1;
                await user.save();

                const userAgentString = req.headers['user-agent'];
                addToBuffer(req.params.userId, user.username, `start mini game`, userAgentString, user.score);

                return res.json({ message: "The game has begun!", miniGameKeys: user.miniGameKeys });
            } else {
                return res.status(400).json({ message: "Not enough Game Keys" });
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    }

    async receiveGamingReward(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const { bodyValue } = req.body;
            console.log(bodyValue)

            const decryptedData = decryptData(bodyValue);
            console.log(decryptedData)

            const schema = Joi.object({
                timestamp: Joi.date().required(),
                gameScore: Joi.number().required(),
                reward: Joi.number().required()
            });

            const { error, value } = schema.validate(decryptedData);
            if (error) {
                return res.status(400).send({ message: "Invalid data", details: error.details });
            }
            console.log(value)

            const { gameScore, reward } = value;
            const user = await User.findOne({ chatId: req.params.userId }, 'miniGame score overallScore').session(session);

            user.miniGame.completedGamesNumber += 1;
            user.score += reward;
            user.overallScore += reward;

            if(gameScore > user.miniGame.dailyBestScore){
                user.miniGame.dailyBestScore = gameScore
            }
            if (user.miniGame.dailyBestScore > user.miniGame.bestScore) {
                user.miniGame.bestScore = user.miniGame.dailyBestScore;
            }

            await user.save({ session });
            await session.commitTransaction();
            session.endSession();

            return res.json({
                message: `Game over, reward received`,
                score: user.score,
                overallScore: user.overallScore,
                completedGamesNumber: user.miniGame.completedGamesNumber,
                bestScore: user.miniGame.bestScore,
                dailyBestScore: user.miniGame.dailyBestScore
            });
        } catch (error) {
            console.log(error);
            await session.abortTransaction();
            session.endSession();
            res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    }
}

module.exports = new miniGameController();
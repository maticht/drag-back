const { User } = require("../../models/user");
const mongoose = require('mongoose');

class miniGameController {

    async startGame(req, res) {
        try {
            const user = await User.findOne({ chatId: req.params.userId }, 'miniGameKeys');

            if (user.miniGameKeys > 0) {
                user.miniGameKeys -= 1;
                await user.save();
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
            const { gameScore, reward } = req.body;
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
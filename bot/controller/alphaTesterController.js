const {User} = require("../../models/user");
const mongoose = require('mongoose');
const {addToBuffer} = require("../../utils/clickHouse/dataBuffer");
const {AlphaUserReward} = require("../../models/alphaUsersReward");

class AlphaTesterController {
    async get(req, res) {
        try {
            const reward = await AlphaUserReward.findOne({chatId: req.params.userId});
            if(reward){
                return res.json({success:true, reward});
            }else{
                return res.json({success:false});
            }
        } catch (error) {
            console.log(error);
            res.status(500).send({success:false, message: "Внутренняя ошибка сервера"});
        }
    }

    async claim(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const user = await User.findOne({chatId: req.params.userId}, 'score overallScore username').session(session);
            if (!user) {
                res.status(400).send({success: false, message: "User not found"});
                await session.abortTransaction();
                session.endSession();
                return;
            }

            const reward = await AlphaUserReward.findOne({chatId: req.params.userId}).session(session);
            if (!reward) {
                res.status(400).send({success: false, message: "Reward not found"});
                await session.abortTransaction();
                session.endSession();
                return;
            }

            user.score += reward.scoreReward;
            user.score += reward.referralReward;

            user.overallScore += reward.scoreReward;
            user.overallScore += reward.referralReward;

            await user.save({session});
            await AlphaUserReward.deleteOne({_id: reward._id}).session(session);

            await session.commitTransaction();
            session.endSession();


            const userAgentString = req.headers['user-agent'];
            addToBuffer(req.params.userId, user.username, `claim alpha reward`, userAgentString, user.score);

            return res.json({
                success: true,
                message: `Reward claimed successfully`,
                score: user.score,
                overallScore: user.overallScore
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.log(error);
            res.status(500).send({message: "Внутренняя ошибка сервера"});
        }
    }

}

module.exports = new AlphaTesterController();
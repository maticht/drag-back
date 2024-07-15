const {User} = require("../../models/user");
const mongoose = require("mongoose");

class ReferralsController {

    async collect(req, res) {
        try {
            const user = await User.findOne({chatId: req.params.userId}, 'referrals score overallScore miniGameKeys');
            if (!user) return res.status(400).send({message: "Invalid queryId"});
            const referralUsers = user.referrals.referralUsers;
            if (!referralUsers || referralUsers.length === 0) {
                return res.status(400).send({message: "No invitees yet"});
            }
            let totalScore = 0;
            let totalGameKeys = 0;
            referralUsers.forEach(referralUser => {
                totalScore += referralUser.score;
                referralUser.score = 0;
                totalGameKeys += referralUser.miniGameKeys
                referralUser.miniGameKeys = 0;
            });

            user.miniGameKeys += totalGameKeys;
            user.score += totalScore;
            user.overallScore += totalScore;
            user.referrals.referralStartTime = Date.now();
            user.referrals.referralCollectionTime = Date.now() + (24 * 60 * 60 * 1000);

            await user.save();

            return res.json({
                score: user.score,
                overallScore: user.overallScore,
                referrals: user.referrals,
                miniGameKeys: user.miniGameKeys
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({message: "Internal Server Error"});
        }
    }

    async replenishment(req, res) {
        try {
            const user = await User.findOne({chatId: req.params.userId}, 'referrals score overallScore miniGameKeys');
            if (!user) return res.status(400).send({message: "Invalid queryId"});

            const referralUsers = user.referrals.referralUsers;
            if (!referralUsers || referralUsers.length === 0) {
                return res.status(400).send({message: "No invitees yet"});
            }

            const referredUsers = await User.find({chatId: {$in: referralUsers.map(u => u.chatId)}}, "chatId overallScore");

            for (const referredUser of referredUsers) {
                const referredUserIndex = referralUsers.findIndex(u => u.chatId === referredUser.chatId);
                if (referredUserIndex !== -1) {
                    referralUsers[referredUserIndex].score += Math.round((referredUser.overallScore - referralUsers[referredUserIndex].lastRefScore) * 0.08);
                    referralUsers[referredUserIndex].lastRefScore = referredUser.overallScore;
                }
            }

            await user.save();

            return res.json({
                score: user.score,
                overallScore: user.overallScore,
                referrals: user.referrals,
                miniGameKeys: user.miniGameKeys
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({message: "Internal Server Error"});
        }
    }

    async collectFromNewReferrals(req, res) {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const user = await User.findOne({ chatId: req.params.userId }).session(session);
            if (!user) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).send({ message: "Invalid queryId" });
            }

            const { rewardsChatIds } = req.body; // массив chatId, пришедший в теле запроса
            if (!Array.isArray(rewardsChatIds) || rewardsChatIds.length === 0) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).send({ message: "Invalid or empty rewardsChatIds array" });
            }

            const newReferralsRewards = user.newReferralsRewards;
            if (!newReferralsRewards || newReferralsRewards.length === 0) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).send({ message: "No new referral rewards to collect" });
            }

            let totalRewardValue = 0;
            let totalKeys = 0;
            const remainingRewards = [];
            newReferralsRewards.forEach(reward => {
                if (rewardsChatIds.includes(reward.chatId)) {
                    totalRewardValue += reward.rewardValue || 0;
                    totalKeys += reward.keys || 0;
                } else {
                    remainingRewards.push(reward);
                }
            });

            user.score += totalRewardValue;
            user.overallScore += totalRewardValue;
            user.miniGameKeys += totalKeys;

            user.newReferralsRewards = remainingRewards;

            await user.save({ session });

            await session.commitTransaction();
            session.endSession();

            return res.json({
                success: true,
                score: user.score,
                overallScore: user.overallScore,
                miniGameKeys: user.miniGameKeys
            });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }
}

module.exports = new ReferralsController();
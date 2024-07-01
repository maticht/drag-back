const {User} = require("../../models/user");

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
            user.referrals.referralCollectionTime = Date.now() + (2 * 60 * 1000);

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

            for (const referralUser of referralUsers) {
                const referredUser = await User.findOne({chatId: referralUser.chatId});
                if (referredUser) {
                    if (user.referrals.referralUsers && user.referrals.referralUsers.length > 0) {
                        const referredUserIndex = user.referrals.referralUsers.findIndex(user => user.chatId === referredUser.chatId);
                        if (referredUserIndex !== -1) {
                            user.referrals.referralUsers[referredUserIndex].score += Math.round((referredUser.score - user.referrals.referralUsers[referredUserIndex].lastRefScore) * 0.08);
                            user.referrals.referralUsers[referredUserIndex].lastRefScore = referredUser.score;
                        }
                    }
                    referredUser.score = Math.round(referredUser.score);
                    await referredUser.save();
                }
            }
            await user.save();

            return res.json({score: user.score, overallScore: user.overallScore, referrals: user.referrals, miniGameKeys: user.miniGameKeys});
        } catch (error) {
            console.error(error);
            res.status(500).send({message: "Internal Server Error"});
        }
    }
}

module.exports = new ReferralsController();
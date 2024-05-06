const router = require("express").Router();
const { User } = require("../../../models/user");

router.put("/:userid/", async (req, res) => {
    try {
        const user = await User.findOne({ chatId: req.params.userid });
        if (!user) return res.status(400).send({ message: "Invalid queryId" });

        const referralUsers = user.referralUsers;
        if (!referralUsers || referralUsers.length === 0) {
            return res.status(400).send({ message: "No invitees yet" });
        }

        for (const referralUser of referralUsers) {
            const referredUser = await User.findOne({ chatId: referralUser.chatId });
            if (referredUser) {
                if (user.referralUsers && user.referralUsers.length > 0) {
                    const referredUserIndex = user.referralUsers.findIndex(user => user.chatId === referredUser.chatId);
                    if (referredUserIndex !== -1) {
                        user.referralUsers[referredUserIndex].score += Math.round(referredUser.score * 0.08);
                    }
                }
                referredUser.score = Math.round(referredUser.score * 0.92);
                await referredUser.save();
            }
        }
        await user.save();

        return res.json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;
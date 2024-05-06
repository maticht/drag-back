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
        let totalScore = 0;
        referralUsers.forEach(referralUser => {
            totalScore += referralUser.score;
            referralUser.score = 0;
        });
        user.score += totalScore;
        user.referralStartTime = Date.now();
        user.referralCollectionTime = Date.now() + (2 * 60 * 1000);

        await user.save();

        return res.json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;
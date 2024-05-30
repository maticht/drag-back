const router = require("express").Router();
const { User } = require("../../../models/user");
const mongoose = require("mongoose"); // Import mongoose to use ObjectId

router.put("/:userid/", async (req, res) => {
    try {
        const allUsers = await User.find().sort({ overallScore: -1 });
        const userTopPlace = allUsers.findIndex((user) => user.chatId === req.params.userid);
        if (userTopPlace === -1) {
            return res.status(404).send({ message: "User not found" });
        }
        const user = allUsers[userTopPlace];
        user.userTopPlace = userTopPlace + 1;
        await user.save();

        return res.json({ user });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

module.exports = router;

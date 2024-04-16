const router = require("express").Router();
const { User } = require("../../models/user");

router.get("/:userid/", async (req, res) => {
    try {
        const user = await User.findOne({ chatId: req.params.userid });
        console.log(req.params.userid)
        if (!user) return res.status(400).send({ message: "Invalid queryId" });
        return res.json({user})
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});


module.exports = router;
const router = require("express").Router();
const { User } = require("../../../models/user");

router.put("/:userid/", async (req, res) => {
    try {
        const user = await User.findOne({ chatId: req.params.userid });
        if (!user) return res.status(400).send({ message: "Invalid queryId" });

        if ('auroraWalletHash' in req.body) {
            if (req.body.auroraWalletHash === "") {
                user.auroraWalletHash = "";
            } else {
                user.auroraWalletHash = req.body.auroraWalletHash;
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
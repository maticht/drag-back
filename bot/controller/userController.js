const {User} = require("../../models/user");

class UserController {
    async getUserData(req, res){
        try {
            const user = await User.findOne({ chatId: req.params.userId });
            console.log(req.params.userId)
            if (!user) return res.status(400).send({ message: "Invalid queryId" });
            return res.json({user})
        } catch (error) {
            res.status(500).send({ message: "Internal Server Error" });
        }
    }

    async getAllUsers(req, res){
        try {
            const users = await User.find().sort({ overallScore: -1 });
            res.send(users);
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    }

    async getUserTopPlace(req, res){
        try {
            const allUsers = await User.find().sort({ overallScore: -1 });
            const userTopPlace = allUsers.findIndex((user) => user.chatId === req.params.userId);
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
    }

    async updateWalletHash(req, res){
        try {
            const user = await User.findOne({ chatId: req.params.userId });
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
    }
}

module.exports = new UserController();
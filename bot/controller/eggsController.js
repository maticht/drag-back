const {User} = require("../../models/user");

class EggsController {

    async modalFlag(req, res, next) {
        try {
            const userId = req.params.userId;
            const user = await User.findOne({ chatId: userId });

            if (!user) {
                return res.status(404).send({ message: "User not found" });
            }

           user.eggs[0].isModalShown = true;


            const savedUser = await user.save();
            return res.status(200).json({ savedUser });
        } catch (error) {
            // Обработка ошибок
            console.log(error);
            return res.status(500).send({ message: "Internal server error" });
        }
    }
}


module.exports = new EggsController()
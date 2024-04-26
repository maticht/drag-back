const {User} = require("../../models/user");

class ScoreController {
    async update(req, res, next) {
        try {
            console.log(req.body);
            let user = await User.findOne({chatId: req.body.userId});
            user.score = req.body.score;
            const savedUser = await user.save();
            console.log(savedUser);
            return res.status(201).send({message: "Счет обновлен успешно"});
        } catch (error) {
            console.log(error);
            res.status(500).send({message: "Внутренняя ошибка сервера"});
        }
    }


}


module.exports = new ScoreController()
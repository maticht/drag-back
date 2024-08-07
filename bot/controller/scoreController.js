const {User} = require("../../models/user");

class ScoreController {
    async update(req, res, next) {
        try {
            console.log(req.body);
            let user = await User.findOne({chatId: req.body.userId}, 'score overallScore eggs');
            if(!user) {
                return res.status(404).send({message: "User not found"});
            }
            user.score = req.body.score;
            user.overallScore = req.body.overallScore;
            if (user.eggs.length > 0) {
                if (user.eggs[0].score === 88 && user.eggs[0].isOpen === false) {
                    user.eggs[0].isOpen = true;
                }
                user.eggs[0].score = req.body.eggScore;
            }
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
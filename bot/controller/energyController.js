const {User} = require("../../models/user");

class EnergyController {
    async update(req, res, next) {
        try {
            console.log(req.body);
            let user = await User.findOne({chatId: req.body.userId});
            user.energy.energyFullRecoveryDate = req.body.energyRestoreTime;
            user.energy.value = req.body.value;
            await user.save();
            return res.status(201).send({message: "Дата восстановления энергии обновлена успешно"});
        } catch (error) {
            console.log(error);
            res.status(500).send({message: "Внутренняя ошибка сервера"});
        }
    }

    async updateBottle(req, res, next) {
        try {
            const user = await User.findOne({chatId: req.params.userId});
            if (!user) return res.status(400).send({message: "Invalid queryId"});

            const energy = user.energy;
            const currentLevel = energy.currentLevel;
            energy.lastEntrance = new Date();
            const price = energy.price[currentLevel - 1];
            if (user.score < price) return res.status(400).send({message: "not enough money"});

            const fullEnergyTimeOld = new Date(energy.energyFullRecoveryDate);
            const now = new Date();
            const diffTime = now.getTime() - fullEnergyTimeOld.getTime();

            let energyValue;
            if (diffTime >= 0) {
                energyValue = energy.energyCapacity[energy.currentLevel - 1];
            } else {
                const energyRestoredPerSecond = energy.energyRecovery[energy.currentLevel - 1];
                const timeSinceLastUpdate = Math.abs(diffTime);
                const secondsSinceLastUpdate = Math.floor(timeSinceLastUpdate / 1000); // количество секунд с последнего обновления
                const energyNotRestored = secondsSinceLastUpdate * energyRestoredPerSecond; // всего восстановленной энергии
                energyValue = energy.energyCapacity[energy.currentLevel - 1] - energyNotRestored + energy.value;
            }
            energy.value = energyValue;

            if (currentLevel < 8) {
                energy.currentLevel++;
                user.score -= price;
            } else {
                return res.status(400).send({message: "Maximum level reached"});
            }

            const timeToRestoreEnergy = 1000; // восстановления энергии в сек
            const energyToRestore = energy.energyCapacity[energy.currentLevel - 1]; // сколько не хватает энергии
            const energyRestoredPerSecond = energy.energyRecovery[energy.currentLevel - 1];
            const totalTimeToRestore = timeToRestoreEnergy * (energyToRestore / energyRestoredPerSecond)//делим на уровень восстановления энергии;

            const currentTime = new Date();

            const energyRestoreTime = new Date(currentTime.getTime() + totalTimeToRestore);

            energy.energyFullRecoveryDate = energyRestoreTime;

            user.energy = energy;

            await user.save();
            return res.json({user})

        } catch (error) {
            console.log(error);
            res.status(500).send({message: "Внутренняя ошибка сервера"});
        }
    }
}


module.exports = new EnergyController()
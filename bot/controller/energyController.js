const {User} = require("../../models/user");
const storeData = require('../../eggsTemplateData/storeTemplateData.json');


class EnergyController {

    async update(req, res, next){
        try {
            const { userId, energyRestoreTime, value } = req.body;

            const updatedUser = await User.findOneAndUpdate(
                { chatId: userId },
                { $set: { 'energy.energyFullRecoveryDate': energyRestoreTime, 'energy.value': value } },
                { new: true, projection: { _id: 0, energy: 1 } }
            );

            if (!updatedUser) {
                return res.status(404).send({ message: "User not found" });
            }

            const { energy } = updatedUser;
            return res.status(201).send({ message: "Дата восстановления энергии обновлена успешно", energy });
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    };

    async updateBottle(req, res, next) {
        try {
            const user = await User.findOne({chatId: req.params.userId}, 'energy score');
            if (!user) return res.status(400).send({message: "Invalid queryId"});

            const energy = user.energy;
            const storeEnergyData = storeData.energyBottle
            const currentLevel = energy.currentLevel;
            energy.lastEntrance = new Date();
            const price = storeEnergyData.price[currentLevel - 1];
            if (user.score < price) return res.status(400).send({message: "not enough money"});

            const fullEnergyTimeOld = new Date(energy.energyFullRecoveryDate);
            const now = new Date();
            const diffTime = now.getTime() - fullEnergyTimeOld.getTime();

            let energyValue;
            if (diffTime >= 0) {
                energyValue = storeEnergyData.energyCapacity[energy.currentLevel - 1];
            } else {
                const energyRestoredPerSecond = storeEnergyData.energyRecovery[energy.currentLevel - 1];
                const timeSinceLastUpdate = Math.abs(diffTime);
                const secondsSinceLastUpdate = Math.floor(timeSinceLastUpdate / 1000); // количество секунд с последнего обновления
                const energyNotRestored = secondsSinceLastUpdate * energyRestoredPerSecond; // всего восстановленной энергии
                energyValue = storeEnergyData.energyCapacity[energy.currentLevel - 1] - energyNotRestored;
            }
            energy.value = energyValue;

            if (currentLevel < 8) {
                energy.currentLevel++;
                user.score -= price;
            } else {
                return res.status(400).send({message: "Maximum level reached"});
            }

            const timeToRestoreEnergy = 1000; // восстановления энергии в сек
            const energyToRestore = storeEnergyData.energyCapacity[energy.currentLevel - 1] - energy.value; // сколько не хватает энергии
            const energyRestoredPerSecond = storeEnergyData.energyRecovery[energy.currentLevel - 1];
            const totalTimeToRestore = timeToRestoreEnergy * (energyToRestore / energyRestoredPerSecond)//делим на уровень восстановления энергии;

            const currentTime = new Date();

            const energyRestoreTime = new Date(currentTime.getTime() + totalTimeToRestore);

            energy.energyFullRecoveryDate = energyRestoreTime;

            user.energy = energy;

            await user.save();
            return res.json({energy: user.energy, score: user.score})

        } catch (error) {
            console.log(error);
            res.status(500).send({message: "Внутренняя ошибка сервера"});
        }
    }

    async addPole(req, res, next) {
        try {
            const energyField = {
                energyFullRecoveryDate: new Date(),
                energyCapacity: [500, 1000, 1500, 2000, 2500, 3000, 4000, 4500],
                energyRecovery: [1, 2, 3, 4, 5, 6, 7, 8],
                lastEntrance: 0,
                currentLevel: 1,
            };

            return res.json({ message: 'Energy field added to users'});
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Внутренняя ошибка сервера" });
        }
    }
}


module.exports = new EnergyController()
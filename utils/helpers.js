const eggs = require("../eggsTemplateData/eggsTemplateData.json");

function getRandomEgg() {
    let randomNumber = Math.floor(Math.random() * 1000) + 1;
    const eggsArr = eggs.eggs;

    const commonRareChance = 700;
    const epicChance = 900;
    const mythicalChance = 999;

    if (randomNumber <= commonRareChance) {
        randomNumber = Math.floor(Math.random() * 5) + 1;

        if (randomNumber <= 2) {
            return eggsArr[0];
        } else if (randomNumber <= 4) {
            return eggsArr[1];
        } else if (randomNumber === 5) {
            return eggsArr[2];
        }
    } else if (randomNumber <= epicChance) {
        randomNumber = Math.floor(Math.random() * 2) + 1;

        if (randomNumber === 1) {
            return eggsArr[3];
        } else if (randomNumber === 2) {
            return eggsArr[4];
        }
    } else if (randomNumber <= mythicalChance) {
        randomNumber = Math.floor(Math.random() * 2) + 1;

        if (randomNumber === 1) {
            return eggsArr[5];
        } else if (randomNumber === 2) {
            return eggsArr[6];
        }
    } else {
        return eggsArr[7];
    }
}

module.exports = getRandomEgg;
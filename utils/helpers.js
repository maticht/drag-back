const eggs = require("../eggsTemplateData/eggsTemplateData.json");
const levelsTemplateData = require("../eggsTemplateData/levelsTemplateData.json");
const moment = require('moment-timezone');
const UAParser = require('ua-parser-js');
const CryptoJS = require("crypto-js");
require('dotenv').config();

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

function checkLevel(user, levelToCheck) {

    const levelMapping = {
        1: levelsTemplateData.SecondLevel,
        2: levelsTemplateData.ThirdLevel,
        3: levelsTemplateData.FourthLevel,
        4: levelsTemplateData.FifthLevel,
        5: levelsTemplateData.SixthLevel,
        6: levelsTemplateData.SeventhLevel,
        7: levelsTemplateData.EighthLevel,
    };

    const nextLevelData = levelMapping[levelToCheck] || null;
    const requirements = nextLevelData.requirements;

    const {
        spending,
        miniGameCompletedPlays,
        referrals,
        barrelWorkTime,
        achievements
    } = requirements;

    const overallScoreReq = requirements.overallScore;

    return (
        (overallScoreReq === null || overallScoreReq <= user.overallScore) &&
        (spending === null || spending <= user.overallScore - user.score) &&
        (miniGameCompletedPlays === null || miniGameCompletedPlays <= user.miniGame.completedGamesNumber) &&
        (referrals === null || referrals <= user.referrals.referralUsers.length) &&
        (barrelWorkTime === null || barrelWorkTime <= user.barrel.workTime) &&
        achievements.every(achievement => user.completedAchievements.includes(achievement.id))
    );
}
function getCurrentMoscowTime() {
    return moment().tz('Europe/Moscow').format('YYYY-MM-DD HH:mm:ss');
}


function parseUserAgent(userAgentString) {
    const parser = new UAParser();
    const result = parser.setUA(userAgentString).getResult();
    return result.os.name;
}

function decryptData(ciphertext) {
    const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.SECRET_KEY);
    const originalData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return originalData;
}

module.exports = {
    getRandomEgg,
    checkLevel,
    getCurrentMoscowTime,
    parseUserAgent,
    decryptData
};
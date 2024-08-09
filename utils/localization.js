const {User} = require("../models/user");

const languageMap = new Map(); // ключ: айди чата, значение: texts[выбранный язык]
const setUsersLanguages = async () => {
    try {
        const users = await User.find();
        users.forEach((user) => {
            languageMap.set(user.chatId, user.language);
        });
        console.log("Языки успешно утсановлены")
    }catch (e){
        console.log(e.message)
    }
}

module.exports = {
    languageMap,
    setUsersLanguages
}
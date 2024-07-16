const {User} = require("../models/user");

const languageMap = new Map(); // ключ: айди чата, значение: texts[выбранный язык]
const setUsersLanguages = async () => {
    const users = await User.find();
    users.map((user) => {
        languageMap.set(user.chatId, user.language);
        console.log(`Для пользователя ${user.firstName} установлен язык ${user.language}`)
    })
    console.log(languageMap)
}

module.exports = {
    languageMap,
    setUsersLanguages
}
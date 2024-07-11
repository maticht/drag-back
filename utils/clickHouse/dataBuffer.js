const {getCurrentMoscowTime, parseUserAgent} = require('../helpers')
let dataBuffer = [];

function addToBuffer(chatId, username, event_name, userAgentString, score) {

    const event_timestamp = getCurrentMoscowTime();
    let platform;

    if(userAgentString){
        platform = parseUserAgent(userAgentString);
    }

    const data = {
        chat_id: chatId || null,
        username: username || null,
        event_timestamp: event_timestamp || null,
        event_name: event_name || null,
        platform: platform || null,
        score: score || null
    };

    dataBuffer.push(data);
}

function getBuffer() {
    return dataBuffer;
}

function clearBuffer() {
    dataBuffer = [];
}

module.exports = { dataBuffer, addToBuffer, getBuffer, clearBuffer };

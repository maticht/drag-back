const {getCurrentMoscowTime, parseUserAgent} = require('../helpers')
let dataBuffer = [];

function addToBuffer(chatId, event_name, userAgentString, language) {

    const event_timestamp = getCurrentMoscowTime();
    let platform;

    if(userAgentString){
        platform = parseUserAgent(userAgentString);
    }

    const data = {
        chat_id: chatId || null,
        event_timestamp: event_timestamp || null,
        event_name: event_name || null,
        platform: platform || null,
        language: language || null
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

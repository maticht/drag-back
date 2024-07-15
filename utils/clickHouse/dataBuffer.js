const {getCurrentMoscowTime, parseUserAgent} = require('../helpers')
const {clickHouseClient} = require("../../clickHouseClient");

let dataBuffer = [];

function addToBuffer(chatId, username, event_name, userAgentString, score) {

    const event_timestamp = getCurrentMoscowTime();
    let platform;

    if(userAgentString){
        platform = parseUserAgent(userAgentString);
    }

    const data = {
        chat_id: chatId.toString() || null,
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
async function insertUserEventToClickHouse() {

    const buffer = getBuffer();

    if (buffer.length === 0) {
        console.log("No data to insert");
        return;
    }

    const tableName = "user_event";

    try {
        const query = `
            INSERT INTO ${tableName} (chat_id, username, event_timestamp, event_name, platform, score)
            VALUES
        `;

        const values = buffer.map(item => {
            const { chat_id, username, event_timestamp, event_name, platform, score } = item;
            return `(${chat_id}, '${username}', '${event_timestamp}', '${event_name}', '${platform}', ${score})`;
        }).join(',');

        const fullQuery = query + values;
        console.log(fullQuery);

        await clickHouseClient.exec({
            query: fullQuery
        });

        console.log('Data inserted to ClickHouse successfully');

        clearBuffer();
    } catch (error) {
        console.error('Error inserting data to ClickHouse:', error);
    }
}

module.exports = { dataBuffer, addToBuffer, getBuffer, clearBuffer, insertUserEventToClickHouse };

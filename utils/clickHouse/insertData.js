const { clickHouseClient } = require('../../clickHouseClient');
const { getBuffer, clearBuffer } = require('./dataBuffer');

async function insertDataToClickHouse() {
    const dataBuffer = getBuffer();

    if (dataBuffer.length === 0) {
        console.log("No data to insert");
        return;
    }

    const tableName = "user_event";

    try {
        const query = `
            INSERT INTO ${tableName} (chat_id, username, event_timestamp, event_name, platform, score)
            VALUES
        `;

        const values = dataBuffer.map(item => {
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

module.exports = {
    insertDataToClickHouse
};

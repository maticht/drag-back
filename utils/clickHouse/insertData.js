const { clickHouseClient } = require('../../clickHouseClient');
const {getBuffer, clearBuffer} = require('./dataBuffer');


async function insertDataToClickHouse() {

    const dataBuffer = getBuffer();

    if (dataBuffer.length === 0) {
        console.log("No data to insert");
        return;
    }

    const tableName = "users_events";

    try {
        const query = `
            INSERT INTO ${tableName} (chat_id, event_timestamp, event_name, platform, language)
            VALUES
        `;

        const values = dataBuffer.map(item => {
            const { chat_id, event_timestamp, event_name, platform, language } = item;
            return `(${chat_id}, '${event_timestamp}', '${event_name}', '${platform}', '${language}')`;
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
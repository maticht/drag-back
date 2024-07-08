const { createClient } = require('@clickhouse/client');
require('dotenv').config();

const clickHouseClient = createClient({
    url: process.env.CLICK_HOUSE_URL,
    username: process.env.CLICK_HOUSE_USERNAME,
    password: process.env.CLICK_HOUSE_PASSWORD,
});
async function checkConnection() {
    try {
        const rows = await clickHouseClient.query({
            query: 'SELECT 1',
            format: 'JSONEachRow',
        });
        const result = await rows.json();
        if (result.length > 0 && result[0]['1'] === 1) {
            console.log('Successfully connected to ClickHouse');
        } else {
            console.error('Failed to verify connection to ClickHouse');
        }
    } catch (error) {
        console.error('Error connecting to ClickHouse:', error);
    }
}

module.exports = { clickHouseClient, checkConnection };

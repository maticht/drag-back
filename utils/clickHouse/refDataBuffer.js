const { clickHouseClient } = require('../../clickHouseClient');

let refDataBuffer = [];

function addToRefBuffer(referrer_chat_id, referral_chat_id) {

    const data = {
        referrer_chat_id: referrer_chat_id.toString() || null,
        referral_chat_id: referral_chat_id.toString() || null
    };

    refDataBuffer.push(data);
}

function getRefBuffer() {
    return refDataBuffer;
}

function clearRefBuffer() {
    refDataBuffer = [];
}

async function insertReferralDataToClickHouse() {

    const buffer = getRefBuffer();

    if (buffer.length === 0) {
        console.log("No referral data to insert");
        return;
    }

    const tableName = "ref_table";

    try {
        const query = `
            INSERT INTO ${tableName} (referrer_chat_id, referral_chat_id)
            VALUES
        `;

        const values = buffer.map(item => {
            const { referrer_chat_id, referral_chat_id } = item;
            return `(${referrer_chat_id}, ${referral_chat_id})`;
        }).join(',');

        const fullQuery = query + values;
        console.log(fullQuery);

        await clickHouseClient.exec({
            query: fullQuery
        });

        console.log('Referral data inserted to ClickHouse successfully');

        clearRefBuffer();
    } catch (error) {
        console.error('Error inserting referral data to ClickHouse:', error);
    }
}

module.exports = { refDataBuffer, addToRefBuffer, getRefBuffer, clearRefBuffer, insertReferralDataToClickHouse };

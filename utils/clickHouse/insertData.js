const { insertUserEventToClickHouse } = require('./dataBuffer');
const { insertReferralDataToClickHouse } = require('./refDataBuffer');

async function insertDataToClickHouse(){
    await insertUserEventToClickHouse();
    await insertReferralDataToClickHouse();
}

module.exports = {
    insertDataToClickHouse
};
const mongoose = require('mongoose');

const alphaUserRewardSchema = new mongoose.Schema({
    chatId: {type: String, required: false, unique: true, index: true},
    scoreReward: {type: Number, required: false, default: 0},
    referralReward: {type: Number, required: false, default: 0},
}, {toJSON: {virtuals: true}});

const AlphaUserReward = mongoose.model("AlphaUserReward", alphaUserRewardSchema);

module.exports = {AlphaUserReward};
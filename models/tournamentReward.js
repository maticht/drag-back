const mongoose = require('mongoose');

const tournamentRewardSchema = new mongoose.Schema({
    chatId: {type: String, required: false, unique: true, index: true},
    miniGameScore: {type: Number, required: false},
    tournamentPlaceInTop: {type: Number, required: false, default: 0},
    auroraTokens: {type: Number, required: false, default: 0},
    rewardIssuedDate: {type: Date, default: Date.now},
    rewardClaimedDate: {type: Date},
    isTaken: {type: Boolean, default: false},
    isAvailable: {type: Boolean, default: false},
}, {toJSON: {virtuals: true}});

const TournamentReward = mongoose.model("TournamentReward", tournamentRewardSchema);

module.exports = {TournamentReward};
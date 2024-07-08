const mongoose = require('mongoose');

const alphaUserSchema = new mongoose.Schema({
    firstName: {type: String, required: false},
    username: {type: String, required: false},
    chatId: {type: String, required: false, unique: true, index: true},
    referrals: {
        referralStartTime: {type: Date, required: false},
        referralCollectionTime: {type: Date, required: false},
        referralUsers: [{
            firstName: {type: String, required: false},
            lastName: {type: String, required: false},
            username: {type: String, required: false},
            chatId: {type: String, required: false},
            score: {type: Number, required: false},
            miniGameKeys: {type: Number, required: false},
            collectionTime: {type: Date, required: false},
            lastRefScore: {type: Number, required: false, default: 0},
        }],
    },
    eggs: [{
        rarity: {type: String, required: false},
        name: {type: String, required: false},
        chance: {type: Number, required: false},
        score: {type: Number, required: false},
        stageScore: [{type: Number, required: false}],
        isOpen: {type: Boolean, default: false},
        isDone: {type: Boolean, default: false},
        isModalShown: {type: Boolean, default: false},
    }],
    score: {type: Number, required: false, default: 0},
    overallScore: {type: Number, required: false, default: 0},
}, {toJSON: {virtuals: true}});

const AlphaUser = mongoose.model("AlphaUser", alphaUserSchema);

module.exports = {AlphaUser};
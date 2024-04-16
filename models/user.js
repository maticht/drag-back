const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: false },
    lastName:{type:String, required:false },
    username:{type:String, required:false},
    chatId: {type: String, required: false},
    language:{type:String, default:'en'},
    subscription: {type: Boolean, default: false},
    walletToken: {type: String, required: false},
    token: {type: String, required: false},
    score: {type:Number, required:false},
    boosters: [{
        multiTap: {type:Number, required:false},
        strength: {type:Number, required:false},
        oneClickIncome: {type:Number, required:false},
        speed: {type:Number, required:false},
        chance: {type:Number, required:false},
        passiveClicks: {type:Number, required:false},
    }],
    hammer: [{
        strength: {type:Number, required:false},
        speed: {type:Number, required:false},
        chance: {type:Number, required:false},
    }],
    assistant: [{
        strength: {type:Number, required:false},
        speed: {type:Number, required:false},
        chance: {type:Number, required:false},
        price: {type:Number, required:false},
    }],
    eggs:[{
        profit: {type:Number, required:false},
        assessedValue: {type:Number, required:false},
        rarity: {type: String, required: false},
        model: {type: String, required: false},
        name: {type: String, required: false},
        protection: {type:Number, required:false},
        chance: {type:Number, required:false},
        price: {type:Number, required:false},
        purchaseStatus: {type: String, required: false},

    }],
    dragons:[{
        profit: {type:Number, required:false},
        assessedValue: {type:Number, required:false},
        rarity: {type: String, required: false},
        model: {type: String, required: false},
        name: {type: String, required: false},
        price: {type:Number, required:false},
        purchaseStatus: {type: String, required: false},
    }],
}, {toJSON: {virtuals: true}});

const User = mongoose.model("User", userSchema);

module.exports = {User};
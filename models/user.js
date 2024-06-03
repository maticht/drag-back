const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: false },
    lastName:{type:String, required:false },
    username:{type:String, required:false},
    chatId: {type: String, required: false},
    childReferral: {type: String, required: false},
    referralStartTime: {type: Date, required:false},
    auroraWalletHash: {type: String, required: false},
    referralCollectionTime: {type: Date, required:false},
    dailyReward:  [
        {
            isRewardTaken: {type: Boolean, default: false},
            dateOfAward: {type: Date, required:false}
        },
        {
            isRewardTaken: {type: Boolean, default: false},
            dateOfAward: {type: Date, required:false}
        },
        {
            isRewardTaken: {type: Boolean, default: false},
            dateOfAward: {type: Date, required:false}
        },
        {
            isRewardTaken: {type: Boolean, default: false},
            dateOfAward: {type: Date, required:false}
        },
        {
            isRewardTaken: {type: Boolean, default: false},
            dateOfAward: {type: Date, required:false}
        },
        {
            isRewardTaken: {type: Boolean, default: false},
            dateOfAward: {type: Date, required:false}
        },
        {
            isRewardTaken: {type: Boolean, default: false},
            dateOfAward: {type: Date, required:false}
        },
    ],
    narrativeScenes:  {
        faultAppearance: {type: Boolean, default: false},
        gettingEgg: {type: Boolean, default: false},
        dragonHatching: {type: Boolean, default: false},
    },
    topUserReward:  {
        reward: {type: Boolean, default: false},
        place: {type: Boolean, default: false},
        isRewardTaken: {type: Boolean, default: false},
    },
    referralUsers:  [{
        firstName: { type: String, required: false },
        lastName:{type:String, required:false },
        username:{type:String, required:false},
        chatId: {type: String, required: false},
        score: {type:Number, required:false},
        collectionTime: {type: Date, required:false},
        lastRefScore: {type:Number, required:false, default:0},
    }],
    language:{type:String, default:'en'},
    userTopPlace: {type:Number, required:false, default:0},
    subscription: {type: Boolean, default: false},
    walletToken: {type: String, required: false},
    firstEntry: {type: Boolean, default: false},
    token: {type: String, required: false},
    score: {type:Number, required:false, default:0},
    overallScore: {type:Number, required:false, default:0},
    energy: {
        name: {type: String, require: false},
        description: {type: String, require: false},
        energyFullRecoveryDate: {type: Date,  default: new Date()},
        value: { type: Number, default: 500},
        images: [{type: String, required: false}],
        energyCapacity: [{type:Number, required:false}],
        energyRecovery: [{type:Number, required:false}],
        levels: [{type:Number, required:false}],
        price: [{type:Number, required:false}],
        currentLevel: {type:Number, required:false},
        lastEntrance: {type: Date, required:false},
    },
    boosters: [{
        multiTap: {type:Number, required:false},
        strength: {type:Number, required:false},
        oneClickIncome: {type:Number, required:false},
        speed: {type:Number, required:false},
        chance: {type:Number, required:false},
        passiveClicks: {type:Number, required:false},
        price: [{type:Number, required:false}],
    }],
    axe: {
        name: {type:String, required:false},
        description: {type:String, required:false},
        strength: [{type:Number, required:false}],
        speed: [{type:Number, required:false}],
        chance: [{type:Number, required:false}],
        level: [{type:Number, required:false}],
        price: [{type:Number, required:false}],
        images: [{type: String, required: false}],
        currentLevel: {type:Number, required:false},
    },
    barrel: {
        name: {type:String, required:false},
        description: {type:String, required:false},
        images: [{type: String, required: false}],
        income: [{type:Number, required:false}],
        level: [{type:Number, required:false}],
        price: [{type:Number, required:false}],
        waitingTime: [{type:Number, required:false}],
        currentLevel: {type:Number, required:false},
        lastEntrance: {type: Date, required:false},
        collectionTime: {type: Date, required:false}
    },
    hammer: {
        name: {type:String, required:false},
        description: {type:String, required:false},
        strength: [{type:Number, required:false}],
        images: [{type: String, required: false}],
        income: [{type:Number, required:false}],
        level: [{type:Number, required:false}],
        price: [{type:Number, required:false}],
        currentLevel: {type:Number, required:false},
    },
    assistant: [{
        strength: {type:Number, required:false},
        speed: {type:Number, required:false},
        chance: {type:Number, required:false},
        price: [{type:Number, required:false}],
    }],
    eggs:[{
        profit: {type:Number, required:false},
        assessedValue: {type:Number, required:false},
        rarity: {type: String, required: false},
        model: {type: String, required: false},
        name: {type: String, required: false},
        images:  {type: 
            {
                model1: [{type: String, required: false}], 
                model2: [{type: String, required: false}], 
                model3: [{type: String, required: false}],
                model4: [{type: String, required: false}],
                model5: [{type: String, required: false}], 
                model6: [{type: String, required: false}], 
                model7: [{type: String, required: false}],
                model8: [{type: String, required: false}],
            }, required: false,},
        protection: {type:Number, required:false},
        chance: {type:Number, required:false},
        price: {type:Number, required:false},
        purchaseStatus: {type: Boolean, default: false},
        stage: {type: Number, required: false},
        score: {type:Number, required:false},
        stageScore: [{type:Number, required:false}],
        isOpen: {type: Boolean, default: false},
        isDone: {type: Boolean, default: false},
        isModalShown: {type: Boolean, default: false},
    }],
    dragons:[{
        profit: {type:Number, required:false},
        assessedValue: {type:Number, required:false},
        rarity: {type: String, required: false},
        model: {type: String, required: false},
        name: {type: String, required: false},
        price: {type:Number, required:false},
        purchaseStatus: {type: Boolean, default: false},
    }],
    weeklyRewards:[{
        league: {type:String, required:false},
        placeInTop: {type:Number, required:false},
        rewardValue: {type:Number, required:false},
        rewardIssuedDate: {type: Date, default: Date.now},
        rewardClaimedDate: {type: Date},
        isTaken: {type: Boolean, default: false},
        isCanceled: {type: Boolean, default: false},
    }],
}, {toJSON: {virtuals: true}});

const User = mongoose.model("User", userSchema);

module.exports = {User};
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: false },
    username:{type:String, required:false},
    chatId: {type: String, required: false, unique: true, index: true},
    profileLevel: {type:Number, required:false, default: 1},
    childReferral: {type: String, required: false},
    auroraWalletHash: {type: String, required: false},
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
    referrals:  {
        referralStartTime: {type: Date, required:false},
        referralCollectionTime: {type: Date, required:false},
        referralUsers :[{
            firstName: { type: String, required: false },
            lastName:{type:String, required:false },
            username:{type:String, required:false},
            chatId: {type: String, required: false},
            score: {type:Number, required:false},
            miniGameKeys: {type:Number, required:false},
            collectionTime: {type: Date, required:false},
            lastRefScore: {type:Number, required:false, default:0},
        }],
    },
    language:{type:String, default:'en'},
    userTopPlace: {type:Number, required:false, default:0},
    userReferralTopPlace: {type:Number, required:false, default:0},
    walletToken: {type: String, required: false},
    firstEntry: {type: Boolean, default: false},
    token: {type: String, required: false},
    score: {type:Number, required:false, default:0},
    overallScore: {type:Number, required:false, default:0},
    energy: {
        energyFullRecoveryDate: {type: Date,  default: new Date()},
        currentLevel: {type:Number, required:false},
        value: {type:Number, required:false, default:0},
        lastEntrance: {type: Date, required:false},
    },
    axe: {
        currentLevel: {type:Number, required:false},
    },
    barrel: {
        currentLevel: {type:Number, required:false},
        collectionTime: {type: Date, required:false},
        lastEntrance: {type: Date, required:false},
        workTime: {type: Number, deafult: 0},
    },
    hammer: {
        currentLevel: {type:Number, required:false},
    },
    eggs:[{
        rarity: {type: String, required: false},
        name: {type: String, required: false},
        chance: {type:Number, required:false},
        score: {type:Number, required:false},
        stageScore: [{type:Number, required:false}],
        isOpen: {type: Boolean, default: false},
        isDone: {type: Boolean, default: false},
        isModalShown: {type: Boolean, default: false},
    }],
    miniGameKeys: {type:Number, required:false, default: 0},
    miniGame:  {
        bestScore: {type:Number, required:false},
        completedGamesNumber: {type:Number, required:false},
    },
    weeklyMiniGameRewards:[{
        placeInTop: {type:Number, required:false},
        rewardValue: {type:Number, required:false},
        rewardIssuedDate: {type: Date, default: Date.now},
        rewardClaimedDate: {type: Date},
        isTaken: {type: Boolean, default: false},
        isCanceled: {type: Boolean, default: false},
    }],
    completedTasks: [{type: String, required: false}],
    completedAchievements: [{type: String, required: false}],
    weeklyScoreRewards:[{
        league: {type:String, required:false},
        placeInTop: {type:Number, required:false},
        rewardValue: {type:Number, required:false},
        rewardIssuedDate: {type: Date, default: Date.now},
        rewardClaimedDate: {type: Date},
        isTaken: {type: Boolean, default: false},
        isCanceled: {type: Boolean, default: false},
    }],
    weeklyReferralRewards:[{
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
const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
    title: {type:String, required:false},
    description: {type:String, required:false },
    reward: {type:Number, required:false },
    image: {type:String, required:false},
    rarity: {type:Number, required:false},
}, {toJSON: {virtuals: true}});

const Achievement = mongoose.model("Achievement", achievementSchema);

module.exports = {Achievement};
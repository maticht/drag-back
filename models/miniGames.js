const mongoose = require('mongoose');

const miniGamesSchema = new mongoose.Schema({
    title: {type:String, required:false},
    description: {type:String, required:false },
    competitionStartTime: {type: Date, default: Date.now},
    competitionEndTime: {type: Date, default: Date.now},
}, {toJSON: {virtuals: true}});

const MiniGames = mongoose.model("MiniGames", miniGamesSchema);

module.exports = {MiniGames};
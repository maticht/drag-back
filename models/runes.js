const mongoose = require('mongoose');

const runesSchema = new mongoose.Schema({
    title: {type:String, required:false},
    codeName: {type:String, required:false},
    isAvailable: {type:Boolean, required:false},
    expirationDate: {type: Date, default: Date.now},
}, {toJSON: {virtuals: true}});

const Runes = mongoose.model("Runes", runesSchema);

module.exports = {Runes};
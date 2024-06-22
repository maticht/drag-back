const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: {type:String, required:false},
    description: {type:String, required:false },
    reward: {type:Number, required:false },
    link: {type:String, required:false},
}, {toJSON: {virtuals: true}});

const Task = mongoose.model("Task", taskSchema);

module.exports = {Task};
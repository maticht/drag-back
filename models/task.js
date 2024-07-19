const mongoose = require('mongoose');

const translationSchema = new mongoose.Schema({
    en: { type: String, required: false },
    ru: { type: String, required: false },
    ua: { type: String, required: false },
    pt: { type: String, required: false },
    es: { type: String, required: false },
}, { _id: false });

const taskSchema = new mongoose.Schema({
    title: { type: translationSchema, required: false },
    description: { type: translationSchema, required: false },
    reward: { type: Number, required: false },
    link: { type: String, required: false },
    checkable: { type: Boolean, required: false },
}, { toJSON: { virtuals: true } });

const Task = mongoose.model("Task", taskSchema);

module.exports = { Task };
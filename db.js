const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
require('dotenv').config();


module.exports = () => {
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };
    try {
        //mongoose.connect(process.env.MONGO_URI, connectionParams);
        mongoose.connect(process.env.MONGO_URI_DEV, connectionParams);
        console.log("Connected to database successfully");
    } catch (error) {
        console.log(error);
        console.log("Could not connect database!");
    }
};


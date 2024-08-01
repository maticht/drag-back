const mongoose = require("mongoose");
mongoose.set('strictQuery', false);
require('dotenv').config();


module.exports = () => {
    const connectionParams = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };
    try {

        if(process.env.APP_MODE === "DEV" || process.env.APP_MODE === "TEST_PROD"){
            mongoose.connect(process.env.MONGO_URI_DEV, connectionParams);//DEV
        }else if(process.env.APP_MODE === "PROD"){
            mongoose.connect(process.env.MONGO_URI_PROD, connectionParams); //PROD
        }

        //mongoose.connect(process.env.MONGO_URI, connectionParams);
        //mongoose.connect(process.env.MONGO_URI_DEV, connectionParams);
        //mongoose.connect(process.env.MONGO_URI_PROD, connectionParams); //PROD


        console.log("Connected to database successfully");
    } catch (error) {
        console.log(error);
        console.log("Could not connect database!");
    }
};


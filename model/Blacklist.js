const mongoose = require("mongoose");


const blacklistSchema = new mongoose.Schema({
    token:{
        type:String
    }


    
})

module.exports = mongoose.model("blacklist",blacklistSchema);
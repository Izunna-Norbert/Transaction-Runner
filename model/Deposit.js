const mongoose = require("mongoose");


const depositSchema = new mongoose.Schema({
    amount:{
        type: Number
    },
    date:{
        type: Date,
    }
    
})

module.exports = mongoose.model("deposit",depositSchema);
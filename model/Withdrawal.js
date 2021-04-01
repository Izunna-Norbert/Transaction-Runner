const mongoose = require("mongoose");


const withdrawalSchema = new mongoose.Schema({
    receiver_account_number:{
        type: Number
    },
    receiver_account_name:{
        type: String
    },
    amount:{
        type: Number
    },
    date:{
        type: Date,
    }
    
})

module.exports = mongoose.model("withdrawal",withdrawalSchema);
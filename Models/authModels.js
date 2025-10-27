    const mongoose = require("mongoose");

    const AuthSchema = new mongoose.Schema({
        email:{
            type:String,
            required:true,
            unique:true
        },
        username:{
            type:String,
            required:true
        },
        password:{
            type:String,
            required:true
        }
    })
    module.exports = mongoose.model("User",AuthSchema);
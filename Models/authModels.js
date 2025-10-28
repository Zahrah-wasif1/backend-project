    const { required } = require("joi");
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
        },
        confirmPassword:{
            type:String,
            // required:true
        },
        resetToken: String,
   resetTokenExpire: Date

        
    })
    module.exports = mongoose.model("User",AuthSchema);
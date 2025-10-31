const mongoose = require("mongoose");

const AuthSchema = new mongoose.Schema({
  fullName: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
  },
  phoneNumber: {
    type: String,
  },
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  idType: {
    type: String,
    enum: ["CNIC", "Passport", "Driving License", "Other"],
  },
  idNumber: {
    type: String,
    unique: true,
  },
//   password: {
//     type: String,
//     required: [true, "Password is required"],
//   },
//         confirmPassword:{
//             type:String,
//             // required:true
//         },
        resetToken: String,
   resetTokenExpire: Date

        
    })
    module.exports = mongoose.model("User",AuthSchema);
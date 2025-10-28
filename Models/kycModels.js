import { required } from "joi";
import mongoose from "mongoose";

const kycSchema = new mongoose.Schema({
  fullName: {
    type:String,
    required:true
},
  email:{ 
    type:String,
    required:true
  },
  phone:{
    type:String,
    required:true
  }, 
  address:{ 
    type:String,
    required:true
    },  
    idType:{
        type:String,},
  idNumber:{ 
    type:String,
    required:true
},
  verificationResult:{
    type:Object,
  },
  createdAt:
   { type: Date, 
    default: Date.now },
});

export const KycRecord = mongoose.model("KycRecord", kycSchema);
